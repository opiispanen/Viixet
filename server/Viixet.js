const send = require('./send.js')
const db = require('./dbInstance.js');

const routes = {
    '/login': {
        post: (req, res) => {
            const 
                body = req.body,
                data = {
                    success: false
                }
                
            login(body.username, body.password)
                .then((user) => {
                    data.user = user;
                    data.success = true;
                    send(res, data)
                })
                .catch((data) => send(
                    res, 
                    Object.assign(data, { success: false })
                ))
        }
    },
    '/logout': {
        get: (req, res) => {
            const
                token = req.header('authorization'),
                data = {
                    success: false
                }

            authenticate(token)
                .then((user) => {
                    clearToken(user.viixetId)
                        .then(() => {
                            data.success = true;
                            send(res, data)
                        })
                })
                .catch((err) => {
                    data.error = err;
                    send(res, data)
                })
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
        get: (req, res) => {
            const token = req.header('authorization')

            authenticate(token)
                .then((user) => {
                    send(res, {
                        success: true,
                        user: user
                    })
                })
                .catch((data) => send(
                    res, 
                    Object.assign(data, { success: false })
                ))
        }
    }
}

function getUser(viixetId) {
    return db.q(
        `SELECT viixetId, username, email FROM viixet.user WHERE viixetId = ?`, 
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
        `SELECT viixetId FROM viixet.user WHERE username = ? OR email = ?`, 
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
            validate: [{ type: 'min', value: 2 }] 
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
            viixet.user (username, password, email) 
        VALUES (?, ?, ?)`, 
        [ 
            username, 
            db.hash(password),
            email
        ]
    ).then((result, fields) => {
        if (!result || !result.insertId)
            return Promise.reject(rejectMessage)
        else
            return result.insertId
    }).catch(() => rejectMessage)
}

function login(username, password) {
    const rejectMessage = {
        success: false,
        error: 'Login failed'
    }
    let user = {}
        
    return db.q(
        `SELECT 
            viixetId, username, email 
        FROM viixet.user 
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
            .then((token) => {
                user.username = row['username'];
                user.email = row['email'];
                user.token = token;

                return user
            })
    }).catch(() => {
        return rejectMessage
    })
}

function authenticate(token) {
    const now = Date.now();
    const threshold = 45 * 60 * 1000;
    const rejectMessage = {
        success: false,
        error: 'Token expired',
        loginRequired: true
    }

    return db.q(
        `SELECT 
            token, viixetId, valid 
        FROM viixet.authtoken 
        WHERE token = ?`, 
        [ token ]
    )
    .then((result, fields) => {
        if (!result[0]) {
            return Promise.reject(rejectMessage)
        }

        const row = result[0]

        if (now - (new Date(row['valid'])).getTime() < threshold) {
            return getUser(row['viixetId'])
                .then((user) => {
                    updateTokenTime(row['token'], row['viixetId']);
                    return user;
                })
        } else {
            return Promise.reject(rejectMessage)
        }
    })
    .catch(() => {
        rejectMessage.error = 'Token not valid';

        return rejectMessage;
    })
}

function createToken(viixetId) {
    const now = (new Date).getTime()
    const token = db.hash(((now / 2) + viixetId + now).toString())

    return db.q(
        `INSERT INTO 
            viixet.authtoken (token, viixetId) 
        VALUES (?, ?)`, 
        [ token, viixetId ]
    ).then((result, fields) => {
        return token;
    })
}

function updateTokenTime(token, viixetId) {
    return db.q(
        `UPDATE viixet.authtoken
        SET valid = NOW()
        WHERE token = ? AND viixetId = ?`, 
        [token, viixetId]
    )
}

function clearToken(viixetId) {
    return db.q(
        `DELETE FROM viixet.authtoken
        WHERE viixetId = ?`, 
        [ viixetId ]
    )
}

function getPublicGroups() {
    return db.q(
        `SELECT * FROM viixet.group WHERE type = 2`, 
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
                    viixet.group_user (viixetId, groupId) 
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
    authenticate
}