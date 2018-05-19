const settings = require('../../settings.js')
const DB = require('./DB.js')
const send = require('./send.js')

class Viixet extends DB {
    constructor() {
        super(settings.viixet);
    }

    getRoutes() {

        return {
            '/login': {
                post: (req, res) => {
                    const 
                        body = req.body,
                        data = {
                            success: false
                        }
                        
                    this.login(body.username, body.password)
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

                    this.authenticate(token)
                        .then((user) => {
                            this.clearToken(user.viixetId)
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
                    
                    this.userAvailable(body.username)
                        .then((result) => {
                            if (!result)
                                send(res, {
                                    error: 'Username exists',
                                    success: false
                                })
                            else
                                this.registration(body.username, body.password)
                                    .then((viixetId) => {
                                        this.getUser(viixetId)
                                            .then((user) => {
                                                this.pushUserGroup(user)
                                                    .then(() => {
                                                        this.getRoutes()['/login'].post(req, res)
                                                    })
                                                    .catch((data) => send(
                                                        res, 
                                                        Object.assign(data, { success: false, method: 'registration' })
                                                    ))
                                            })
                                            .catch((data) => send(
                                                res, 
                                                Object.assign(data, { success: false, method: 'registration' })
                                            ))
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

                    this.authenticate(token)
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
    }

    getUser(viixetId) {
        return new Promise((resolve, reject) => {
            this.query(
                `SELECT viixetId, username, email FROM user WHERE viixetId = ?`, 
                [ viixetId ],
                (err, rows, fields) => {
                    if (err) reject(err)
                    
                    if (!rows || !rows.length)
                        reject({
                            error: 'User not found'
                        })
                    else
                        resolve(rows[0])
                }
            )
        })
    }

    userAvailable(username) {
        return new Promise((resolve, reject) => {
            this.query(
                `SELECT viixetId FROM user WHERE username = ?`, 
                [ username ],
                (err, rows, fields) => {
                    if (err) reject(err)
                    else
                        resolve(!rows || !rows.length)
                }
            )
        })
    }

    registration(username, password) {
        return new Promise((resolve, reject) => {
            const validation = this.validate([
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
                /*,{
                    name: 'Email',
                    data: email,
                    validate: [{ type: 'email' }] 
                }*/
            ]).filter(field => field.valid === false)
            
            if (validation.length > 0) {
                reject({
                    error: validation
                            .map((field) => field.errors)
                            .reduce((errors, error) => errors.concat(error), [])
                })
                return false;
            }

            this.query(
                `INSERT INTO 
                    user (username, password) 
                VALUES (?, ?)`, 
                [ 
                    username, 
                    this.hash(password)
                ],
                (err, result) => {
                    if (err) reject(err)
                    else {
                        if (!result || !result.insertId)
                            reject({
                                error: 'Registration failed'
                            })
                        else
                            resolve(result.insertId)
                    }
                }
            )
        })
    }

    login(username, password) {
        return new Promise((resolve, reject) => {
            let user = {}
            
            this.query(
                `SELECT 
                    viixetId, username, email 
                FROM user 
                WHERE username = ? AND password = ?`, 
                [
                    username, 
                    this.hash(password)
                ],
                (err, rows, fields) => {
                    if (err) reject(err)
                    
                    if (!rows || !rows.length)
                        reject({
                            error: 'Login failed'
                        })
                    else {
                        const row = rows[0]
                        
                        this.clearToken(row['viixetId'])
                            .then(() => {
                                this.createToken(row['viixetId'])
                                .then((token) => {
                                    user.username = row['username'];
                                    user.email = row['email'];
                                    user.token = token;

                                    resolve(user)
                                })
                                .catch(reject)
                            })
                    }
                }
            )
        })
    }

    authenticate(token) {
        return new Promise((resolve, reject) => {
            const now = Date.now();
            const threshold = 45 * 60 * 1000;

            this.query(
                `SELECT 
                    token, viixetId, valid 
                FROM authtoken 
                WHERE token = ?`, 
                [ token ],
                (err, rows, fields) => {
                    if (err) reject(err)
                    
                    if (!rows || !rows[0])
                        reject({
                            error: 'Token not valid'
                        })
                    else {
                        const row = rows[0]

                        if (now - (new Date(row['valid'])).getTime() < threshold) {
                            this.getUser(row['viixetId'])
                                .then((user) => {
                                    this.updateTokenTime(row['token'], row['viixetId']);
                                    resolve(user)
                                })
                                .catch((err) => reject(err))
                        } else {
                            reject({
                                error: 'Token expired'
                            })
                        }
                    }
                }
            )
        })
    }

    createToken(viixetId) {
        const now = (new Date).getTime()
        const token = this.hash(((now / 2) + viixetId + now).toString())

        return new Promise((resolve, reject) => {
            this.query(
                `INSERT INTO 
                    authtoken (token, viixetId) 
                VALUES (?, ?)`, 
                [ token, viixetId ],
                (err, rows, fields) => {
                    if (err) reject(err)
                    else
                        resolve(token)
                }
            )
        })
    }

    updateTokenTime(token, viixetId) {
        this.query(
            `UPDATE authtoken
            SET valid = NOW()
            WHERE token = ? AND viixetId = ?`, 
            [token, viixetId],
            (err, rows, fields) => {
                if (err) throw err
            }
        )
    }

    clearToken(viixetId) {
        return new Promise((resolve, reject) => {
            this.query(
                `DELETE FROM authtoken
                WHERE viixetId = ?`, 
                [ viixetId ],
                (err, rows, fields) => {
                    if (err) reject(err)
                    else
                        resolve()
                }
            )
        })
    }

    getPublicGroups() {
        return new Promise((resolve, reject) => {
            this.query(
                `SELECT * FROM \`group\` WHERE \`type\` = 2`, 
                [],
                (err, rows, fields) => {
                    if (err) reject(err)
                    else
                        resolve(!!rows ? rows : [])
                }
            )
        })
    }

    pushUserGroup(user) {
        return new Promise((resolve, reject) => {
            this.getPublicGroups()
                .then((groups) => {
                    if (!!groups[0])
                        this.query(
                            `INSERT INTO 
                                group_user (viixetId, groupId) 
                            VALUES (?, ?)`, 
                            [ user.viixetId, groups[0].groupId ],
                            (err, rows, fields) => {
                                if (err) reject(err)
                                else
                                    resolve()
                            }
                        )
                })
        })
    }
}

module.exports = new Viixet()