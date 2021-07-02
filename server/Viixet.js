const send = require('./send.js')
const db = require('./dbInstance.js')
const authScheme = process.env.DB_AUTH_SCHEME;
const salt = process.env.DB_SALT || '';
const tokenName = process.env.AUTH_TOKENNAME;
const threshold = 604800000; // 1 week // 45 * 60 * 1000; // 45 minutes
const TOKEN_TYPES = {
    login: 0,
    passwordRequest: 1
}

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
    '/resetpassword/:token': {
        post: resetPasswordEndpoint
    },
    '/resetpassword': {
        post: requestResetPasswordEndpoint
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
    }
}

async function resetPasswordEndpoint(req, res) {
    const body = req.body
    const params = req.params
    const data = { success: false }

    try {
        const user = await validateToken(params.token, TOKEN_TYPES.passwordRequest)
        const clearResult = await clearToken(user.viixetId, params.token)
        const result = await changePassword(user.viixetId, body.password)

        data.success = true;
        send(res, data)
    } catch(error) {
        send(res, { ...data, error })
    }
}


async function requestResetPasswordEndpoint(req, res)  {
    const body = req.body
    const data = { success: false }
    
    try {
        const viixetId = await userAvailable(body.username, body.email, true);
        
        if (viixetId !== null) {
            try {
                const result = await requestResetPassword(viixetId, body.email, body.lang);
                
                data.success = true;
                data.result = result;
                send(res, data)
            } catch(error) {
                send(
                    res, 
                    { error, success: false, level: 2 }
                )
            }
        } else {
            send(
                res, 
                { error: 'FAILED', success: false, level: 1 }
            )
        }
    } catch(error) {
        send(
            res, 
            { error: 'FAILED', success: false, level: 0 }
        )
    }
}

function getUser(viixetId) {
    return db.q(
        `SELECT viixetId, username, email FROM ${ authScheme }user WHERE viixetId = ?`, 
        [ viixetId ]
    ).then(async (result, fields) => {
        if (!result || !result.length)
            return Promise.reject({
                success: false,
                error: 'User not found'
            })
        else {
            const user =  result[0];

            try {
                const groups = await getUserGroups(viixetId)
                user.groups = groups;
            } catch(e) {
                user.groupError = e;
                user.groups = [];
            }
            
            return user;
        }
    })
}

function getUserGroups(viixetId) {
    return db.q(
        `SELECT t3.groupId, t3.name, t3.created, t3.type 
        FROM ${ authScheme }user t1
        INNER JOIN ${ authScheme }group_user t2 ON t2.viixetId = t1.viixetId
        INNER JOIN ${ authScheme }\`group\` t3 ON t3.groupId = t2.groupId
        WHERE t1.viixetId = ?`, 
        [ viixetId ]
    ).then((result, fields) => {
        return !!result && !!result.length ? result.map(db.mapDates) : []
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

function changePassword(viixetId, password) {
    const hash = db.hash(password)

    return db.q(
        `UPDATE ${ authScheme }user SET password = ? WHERE viixetId = ?`,
        [ hash, viixetId ]
    ).then((result) => {
        if (!result.affectedRows) {
            return Promise.reject('PASSWORD_UPDATE_FAILED')
        }

        return result.affectedRows;
    })
}

function validateToken(token, type = 0) {
    const now = Date.now();
    let tokenTTL = threshold;

    if (TOKEN_TYPES.passwordRequest) {
        tokenTTL = 45 * 60 * 1000;
    }

    return db.q(
        `SELECT 
            token, viixetId, valid 
        FROM ${ authScheme }authtoken 
        WHERE token = ? AND \`type\` = ?`, 
        [ token, type ]
    )
    .then((result, fields) => {
        if (!result[0]) {
            return Promise.reject('ERROR_TOKEN_INVALID')
        }

        const row = result[0]

        if (now - (new Date(row['valid'])).getTime() < tokenTTL) {
            return {
                viixetId: row.viixetId
            }
        }

        return Promise.reject('ERROR_TOKEN_EXPIRED')
    })
}

async function requestResetPassword(viixetId, email, lang) {
    const t = translator.translate;
    try {
        const result = await createToken(viixetId, TOKEN_TYPES.passwordRequest);

        if (!result.token) {
            return Promise.reject('ERROR_NO_TOKEN');
        }

        const link = `${ process.env.BASE_URL }/#/resetpassword/${ result.token }`;
        try {
            //return Promise.resolve();
            
            const mailResult = await mailer.sendMail(
                email,
                t(lang, 'FORGOTPASSWORD_SUBJECT'),
                `${ t(lang, 'FORGOTPASSWORD_TEXT') } ${ link }`,
                `${ t(lang, 'FORGOTPASSWORD_TEXT') } <a href="${ link }">${ link }</a>`
            );
    
            return Promise.resolve(mailResult);
        } catch(error) {
            return Promise.reject(error);
        }
    } catch(error) {
        return Promise.reject(error);
    }
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
            return Promise.reject({
                ...rejectMessage,
                level: 1
            })
        }
        
        const row = result[0]
        
        return createToken(row['viixetId'])
            .then(async (auth) => {
                let user = false;
                try {
                    user = await getUser(row['viixetId'])
                } catch(e) {
                    user = {
                        username: row['username'],
                        email: row['email']
                    }
                }
                return {
                    user,
                    auth
                }
            })
    }).catch((error) => {
        return Promise.reject({
            ...rejectMessage,
            level: 2,
            error
        })
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

function createToken(viixetId, type = 0) {
    const token = db.hash(
        viixetId 
        + salt 
        + (new Date).toISOString()
    )

    return db.q(
        `INSERT INTO 
            ${ authScheme }authtoken (token, viixetId, \`type\`) 
        VALUES (?, ?, ?)`, 
        [ token, viixetId, type ]
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
    authenticate
}