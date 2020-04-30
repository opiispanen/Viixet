const db = require('./dbInstance.js')
const uuid = require('uuid-random')
const path = require('path');
const fs = require('fs')
const send = require('./send.js')
const fileLocation = process.env.FILE_LOCATION

const routes = {
    '/files': {
        authenticate: {
            get: true,
            post: true
        },
        post: uploadFiles,
        get: getUserFiles
    },
    '/files/:fileId': {
        authenticate: {
            delete: true,
        },
        delete(req, res, user) {
            const params = req.params;

            deleteFile(params.fileId, user)
                .then((result) => send(res, { success: true }))
                .catch((data) => send(
                    res, 
                    Object.assign(data, { success: false })
                ))
        }
    },
    '/files/:uuid/:name': {
        get: getFile
    },
    '/files/request': {
        authenticate: {
            post: true
        },
        post: requestFilePrivileges
    }
}

async function uploadFiles(req, res, user) {
    if (!req.files) {
        send(
            res, 
            { success: false, error: 'FILE_UPLOAD_ERROR_NOFILES' },
            400
        )
        return;
    }

    const data = { success: false }
    const params = req.params
    const fileNames = Object.keys(req.files)

    try {
        const filePrivileges = await getFileQuota(user);

        if (filePrivileges.active < 2) {
            send(
                res, 
                { success: false, error: 'File privileges have not been accepted yet' },
                400
            )
            return;
        }

        let hasSpace = true;
        let mimesLegit = true;
        let fileSizeLegit = true;
        let totalFileSize = 0;
        
        if (!filePrivileges.hasSpace) {
            hasSpace = false;
        } else {
            fileNames.forEach((key) => {
                const file = req.files[key]

                if (Number.MAX_SAFE_INTEGER < file.size) {
                    fileSizeLegit = false;
                    return;
                }

                totalFileSize += file.size * 0.000001;
                // TODO: check mimetype from tmp file and compare to meta data??
                if (!mimesLegit || !fileSizeLegit) return;

                if (filePrivileges.mimetypes.indexOf(file.mimetype) < 0) {
                    mimesLegit = false;
                }

                if (file.size * 0.000001 > filePrivileges.maxsize) {
                    fileSizeLegit = false;
                }
            })
        }
        
        if (!hasSpace || (filePrivileges.quota - filePrivileges.used < totalFileSize)) {
            send(
                res, 
                { success: false, error: 'User has no space left in quota' },
                400
            )
            return;
        }

        if (!fileSizeLegit) {
            send(
                res, 
                { success: false, error: 'Max file size limit is: '+filePrivileges.maxsize+' Mb' },
                400
            )
            return;
        }

        if (!mimesLegit) {
            send(
                res, 
                { success: false, error: 'File type not allowed' },
                400
            )
            return;
        }
    } catch(e) {
        send(
            res, 
            { success: false, error: 'User has no quota' },
            400
        )
        return;
    }
    
    Promise.all(
        fileNames.map(name => {
            const file = req.files[name]
    
            return uploadFile(file, user)
        })
    ).then((rows) => {
        data.success = true;
        data.rows = rows;

        send(res, data)
    })
    .catch((data) => send(
        res, 
        Object.assign(data, { success: false, error: 'Failed to upload file' }),
        400
    ))
}

function uploadFile(file, user) {
    const fileUuid = uuid()

    return new Promise((resolve, reject) => {
        pushFile(file, fileUuid, user)
            .then((fileId) => {
                moveFile(file, fileUuid)
                    .then(() => {
                        resolve({
                            id: fileId,
                            name: file.name,
                            url: `${ process.env.FILE_BASE_URL || '' }/files/${ fileUuid }/${ file.name }`,
                            mimetype: file.mimetype,
                            size: file.size
                        })
                    }).catch(reject)
            }).catch(reject)
    })
}

async function deleteFile(fileId, user) {
    let file;

    try {
        file = await getFileById(fileId, user);
    } catch(err) {
        return Promise.reject(err);
    }
    
    return db.q(
        `UPDATE file
        SET deleted = 1
        WHERE id = ? AND viixetId = ?`, 
        [ fileId, user.viixetId ]
    )
    .then((result, fields) => {
        if (result.affectedRows <= 0) {
            return Promise.reject('File not found or no privileges');
        }

        try {
            fs.unlinkSync(path.join(__dirname, fileLocation + file.uuid))
        } catch(err) {
            console.log('Error while deleting a file: ',err,' file uuid: ',file.uuid,' fileId: ',fileId)
            return Promise.reject(err);
        }

        return true;
    })
    .catch((err) => Promise.reject({
        error: 'Deleting a file failed: '+err
    }))
}

function moveFile(file, fileUuid) {
    return new Promise((resolve, reject) => {
        file.mv(path.join(__dirname, fileLocation+fileUuid), (err) => {
            if (err) reject({ success: false, error: err })
            else resolve()
        })
    })
}

function pushFile(file, fileUuid, user) {
    const insert = [
        user.viixetId,
        file.name,
        file.size,
        file.mimetype,
        fileUuid,
        file.md5
    ];
    
    return db.q(
        `INSERT INTO file 
            (viixetId, name, size, mime, uuid, checksum, created) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())`, 
        insert
    )
    .then((result, fields) => {
        return result.insertId;
    })
    .catch(() => Promise.reject({
        success: false,
        error: 'Pushing a file failed'
    }))
}

function getUserFiles(req, res, user) {
    const data = { success: false }

    db.q(
        `SELECT * FROM file
        WHERE viixetId = ? AND deleted = 0`, 
        [user.viixetId]
    ).then(async (result, fields) => {
        const rows = result && !!result.length ? result : [];
        
        data.rows = rows.map(row => ({
            id: row.id,
            name: row.name,
            url: `${ process.env.FILE_BASE_URL || '' }/files/${ row.uuid }/${ row.name }`,
            mimetype: row.mime,
            size: row.size
        }))
        data.success = true;

        try {
            const filePrivileges = await getFileQuota(user);

            if (filePrivileges.active === 2) {
                filePrivileges.enabled = true;
                filePrivileges.requested = true;
            } else if (filePrivileges.active === 1) {
                filePrivileges.enabled = false;
                filePrivileges.requested = true;
            }
            
            data.privileges = filePrivileges;
        } catch(e) {
            data.privileges = {
                enabled: false,
                requested: false,
                hasSpace: 0,
                used: 0,
                quota: 0,
                mimetypes: [],
                maxsize: 0,
                error: e
            }
        }
        
        send(res, data)
    })
    .catch((data) => send(
        res, 
        Object.assign(data, { success: false })
    ))
}

function getFileById(fileId, user) {
    return db.q(
        `SELECT * FROM file
        WHERE id = ? AND viixetId = ?
        LIMIT 1`, 
        [ fileId, user.viixetId ]
    ).then((result) => {
        if (!result.length || result.length <= 0) {
            return Promise.reject('File not found or no privileges');
        }

        return result[0];
    })
}

function getFile(req, res) {
    const params = req.params

    res.header('Access-Control-Allow-Origin', '*');

    db.q(
        `SELECT uuid, mime FROM file
        WHERE uuid = ? AND name = ?
        LIMIT 1`, 
        [params.uuid, params.name]
    )
    .then((result, fields) => {
        const rows = result && !!result.length ? result : [];
        res.setHeader('Content-Type', rows[0].mime);
        res.status(200);
        res.sendFile(path.join(__dirname, fileLocation+rows[0].uuid));
    })
    .catch(() => {
        send(
            res,
            { success: false, error: 'File not found' },
            404
        )
    })
}

function getFileQuota(user) {
    return db.q(
        `SELECT 
            IF(t2.used IS NULL || t2.used < t1.quota, 1, 0) as hasSpace,
            IF(t2.used IS NOT NULL, t2.used, 0) as used,
            t1.quota,
            t1.mimetypes,
            t1.maxsize,
            t1.active,
            t1.messages
        FROM filequota t1
        left join 
        (SELECT 
            TRUNCATE(SUM(f1.size) * 0.000001, 2) as used,
            f1.viixetId
        FROM file f1
        group by f1.viixetId) t2 ON t2.viixetId = t1.viixetId
        where t1.viixetId = ? AND t1.active != 0`,
        [user.viixetId]
    ).then((result, fields) => {
        const rows = result && !!result.length ? result : [];
        
        if (rows[0].active === null) {
            return Promise.reject();
        }

        return rows.map(row => {
            row.mimetypes = !!row.mimetypes ? JSON.parse(row.mimetypes) : []
            return row;
        })[0];
    })
}

async function requestFilePrivileges(req, res, user) {
    const body = req.body;
    const messages = typeof body.messages !== 'undefined' ? body.messages : '';

    try {
        // check for existing privileges
        const filePrivileges = await getFileQuota(user)

        if (typeof filePrivileges !== 'undefined') {
            send(
                res,
                { success: false, error: filePrivileges.active === 2 ? 'Privileges already exist' : 'Privileges already requested' },
                400
            )
            return;
        }
    } catch(e) {
        // nothing to see, everything is okay...
    }

    db.q(
        `INSERT INTO filequota (viixetId, messages, created) 
            VALUES (?, ?, NOW())`,
        [user.viixetId, db.sanitize(messages)]
    ).then((result, fields) => {
        if (!!result.insertId) {
            send(
                res,
                { success: true }
            )
        } else {
            send(
                res,
                { success: false, error: 'Error while requesting privileges' },
                400
            )
        }
    }).catch(e => send(
        res,
        { success: false, error: 'Error while requesting privileges' },
        400
    ))
}

module.exports = routes