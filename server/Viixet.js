const send = require('./send.js')
const db = require('./dbInstance.js')
const authScheme = process.env.DB_AUTH_SCHEME
const tokenName = process.env.AUTH_TOKENNAME
const threshold = 604800000; // 1 week // 45 * 60 * 1000; // 45 minutes

const routes = {
    '/login': {
        post: (req, res) => {
            const 
                body = req.body,
                data = {
                    success: false
                }
                
            login(body.username, body.password)
                .then((response) => {
                    const auth = response.auth;
                    data.user = response.user;
                    data.success = true;
                    
                    res.cookie(tokenName, auth.token, {
                        expires: new Date(Date.now() + threshold),
                        secure: req.protocol === 'https',
                        httpOnly: true,
                    });

                    send(res, data)
                })
                .catch((data) => send(
                    res, 
                    Object.assign(data, { success: false })
                ))
        }
    },
    '/logout': {
        get: (req, res, user) => {
            const data = {
                success: false
            }

            if (user !== false) {
                clearToken(user.viixetId)
                    .then(() => {
                        data.success = true;
                        res.clearCookie(tokenName);
                        send(res, data)
                    })
                    .catch((err) => {
                        data.error = err;
                        send(res, data, 400)
                    })
            } else {
                send(res, data, 401)
            }
        }
    },
    '/registration': {
        post: (req, res) => {
            const 
                body = req.body,
                data = {
                    success: false
                }
            
            userAvailable(body.username, body.email)
                .then((result) => {
                    if (!result)
                        send(res, {
                            error: 'User already exists',
                            success: false
                        })
                    else
                        registration(body.username, body.password, body.email)
                            .then((viixetId) => {
                                routes['/login'].post(req, res)
                            })
                            .catch((data) => send(
                                res, 
                                Object.assign(data, { success: false, method: 'registration' })
                            ))
                })
                .catch((data) => send(
                    res, 
                    Object.assign(data, { error: 'Username taken', success: false })
                ))
        }
    },
    '/authenticate': {
        get: (req, res, user) => {
            if (user !== false) {
                delete user.viixetId;
                
                send(res, {
                    success: true,
                    user: user
                })
            } else {
                send(res, { success: false }, 401)
            }
        }
    },
    '/ping': {
        get: (req, res) => {
            send(res, {
                success: true,
                timestamp: (new Date()).toISOString()
            })
        }
    }
}

function getUser(viixetId) {
    return db.q(
        `SELECT viixetId, username, email FROM ${ authScheme }user WHERE viixetId = ?`, 
        [ viixetId ]
    ).then((result, fields) => {
        if (!result || !result.length)
            return Promise.reject({
                success: false,
                error: 'User not found'
            })
        else
            return result[0]
    })
}

function userAvailable(username, email) {
    return db.q(
        `SELECT viixetId FROM ${ authScheme }user WHERE username = ? OR email = ?`, 
        [ username, email ]
    ).then((result, fields) => {
        return !result || !result.length
    })
}

function registration(username, password, email) {
    const rejectMessage = {
        success: false,
        error: 'Registration failed'
    }
    const validation = db.validate([
        {
            name: 'User name',
            data: username,
            validate: [
                { type: 'min', value: 2 },
                { type: 'regex', value: /^[a-zA-Z0-9._%@?!+-]+$/g }
            ] 
        },
        {
            name: 'Password',
            data: password,
            validate: [{ type: 'min', value: 1 }] 
        }
        ,{
            name: 'Email',
            data: email,
            validate: [{ type: 'email' }] 
        }
    ]).filter(field => field.valid === false)
    
    if (validation.length > 0) {
        return Promise.reject({
            error: validation
                    .map((field) => field.errors)
                    .reduce((errors, error) => errors.concat(error), [])
        })
    }

    return db.q(
        `INSERT INTO 
            ${ authScheme }user (username, password, email) 
        VALUES (?, ?, ?)`, 
        [ 
            username.trim(), 
            db.hash(password),
            email.trim()
        ]
    ).then((result, fields) => {
        if (!result || !result.insertId)
            return Promise.reject(rejectMessage)
        else
            return result.insertId
    }).catch(() => Promise.reject(rejectMessage))
}

function login(username, password) {
    const rejectMessage = {
        success: false,
        error: 'Login failed'
    }
        
    return db.q(
        `SELECT 
            viixetId, username, email 
        FROM ${ authScheme }user 
        WHERE username = ? AND password = ?`, 
        [
            username, 
            db.hash(password)
        ]
    ).then((result, fields) => {
        if (!result || !result.length) {
            return Promise.reject(rejectMessage)
        }
        
        const row = result[0]
        
        return createToken(row['viixetId'])
            .then((auth) => {
                return {
                    user: {
                        username: row['username'],
                        email: row['email']
                    },
                    auth
                }
            })
    }).catch(() => {
        return Promise.reject(rejectMessage)
    })
}

function authenticate(token, req, res) {
    const now = Date.now();
    const rejectMessage = {
        success: false,
        error: 'Token expired',
        loginRequired: true
    }

    if (typeof token !== 'string') {
        return Promise.reject({...rejectMessage, level:0})
    }

    return db.q(
        `SELECT 
            token, viixetId, valid 
        FROM ${ authScheme }authtoken 
        WHERE token = ?`, 
        [ token ]
    )
    .then((result, fields) => {
        if (!result[0]) {
            return Promise.reject({...rejectMessage, level:3})
        }

        const row = result[0]

        if (now - (new Date(row['valid'])).getTime() < threshold) {
            return getUser(row['viixetId'])
                .then((user) => {
                    res.cookie(tokenName, token, {
                        expires: new Date(Date.now() + threshold),
                        secure: req.protocol === 'https',
                        httpOnly: true,
                        overwrite: true
                    });
                    updateTokenTime(row['token'], row['viixetId']);
                    return user;
                })
                .catch((error) => Promise.reject({...rejectMessage, level:1}))
        } else {
            return Promise.reject({...rejectMessage, level:2})
        }
    })
    .catch((error) => Promise.reject(error))
}

function getUserByToken(token) {
    const now = Date.now();
    const rejectMessage = {
        success: false,
        error: 'Token expired',
        loginRequired: true
    }

    return db.q(
        `SELECT 
            token, viixetId, valid 
        FROM ${ authScheme }authtoken 
        WHERE token = ?`, 
        [ token ]
    )
    .then((result, fields) => {
        if (!result[0]) {
            return Promise.reject({...rejectMessage, level:3})
        }

        const row = result[0]

        if (now - (new Date(row['valid'])).getTime() < threshold) {
            return getUser(row['viixetId'])
                .catch((error) => Promise.reject({...rejectMessage, level:1}))
        } else {
            return Promise.reject({...rejectMessage, level:2})
        }
    })
    .catch((error) => Promise.reject(error))
}

function createToken(viixetId) {
    const now = (new Date).getTime()
    const token = db.hash(((now / 2) + viixetId + now).toString())

    return db.q(
        `INSERT INTO 
            ${ authScheme }authtoken (token, viixetId) 
        VALUES (?, ?)`, 
        [ token, viixetId ]
    ).then((result, fields) => {
        return {
            token
        };
    })
}

function updateTokenTime(token, viixetId) {
    return db.q(
        `UPDATE ${ authScheme }authtoken
        SET valid = NOW()
        WHERE token = ? AND viixetId = ?`, 
        [token, viixetId]
    )
}

function clearToken(viixetId) {
    return db.q(
        `DELETE FROM ${ authScheme }authtoken
        WHERE viixetId = ?`, 
        [ viixetId ]
    )
}

function getPublicGroups() {
    return db.q(
        `SELECT * FROM ${ authScheme }group WHERE type = 2`, 
        [ user.viixetId ]
    ).then((result, fields) => {
        return result && !!result.length ? result : [];
    })
}

function pushUserGroup(user) {
    return getPublicGroups()
        .then((groups) => {
            db.query(
                `INSERT INTO 
                    ${ authScheme }group_user (viixetId, groupId) 
                VALUES (?, ?)`, 
                [ user.viixetId, groups[0].groupId ],
                (err, rows, fields) => {
                    if (err) reject(err)
                    else
                        resolve()
                }
            )
        })
}

module.exports = {
    routes,
    authenticate,
    getUserByToken
}