const mysql = require('mysql')
const sha256 = require('sha256')
const emailValidator = require('email-validator')
const sanitizeHtml = require('sanitize-html')
let dateFields = ['created', 'modified']

class DB {
    /**
     * 
     * @param {Object} settings 
     */
    constructor(settings) {
        //this.connection = mysql.createConnection(settings);
        this.pool = mysql.createPool(settings);
    }

    setDateFields(fields) {
        dateFields = ['created','modified',...fields];
    }
    /**
     * 
     * @param {String} string 
     */
    hash(string) {
        return sha256(string)
    }

    query() {
        //this.connection.query.apply(this.connection, arguments)
        this.pool.getConnection((err, conn) => {
            if (!!err && !!err.code) {
                if (typeof arguments[2] === 'function') {
                    arguments[2](err, [], {});
                }
            } else {
                const q = conn.query.apply(conn, arguments);

                q.on('end', () => {
                    conn.release();
                });
            }
        })
    }

    q(query, link = []) {
        return new Promise((resolve, reject) => {
            this.query.call(
                this, 
                query, 
                link,
                (err, rows, fields) => {
                    if (err) reject(err)
                    else {
                        const result = rows && (!!rows.length || !!rows.insertId || !!rows.affectedRows) ? rows : [];

                        resolve(result);
                    }
                }
            )
        })
    }

    mapDates(obj) {
        const dateToTimestamp = (date) => (new Date(date)).toISOString();
        
        dateFields.forEach(name => {
            if (!!obj[name]) {
                obj[name] = dateToTimestamp(obj[name]);
            }
        })

        return obj;
    }

    /**
     * 
     * @param {String} dirty 
     */
    htmlToText(dirty) {
        return sanitizeHtml(dirty, { allowedTags: [] })
    }

    /**
     * 
     * @param {String} dirty 
     */
    sanitize(dirty, settings = {}) {
        return sanitizeHtml(dirty, settings)
    }

    /**
     * 
     * @param {String} email 
     */
    validateEmail(email) {
        return emailValidator.validate(email);
    }

    /**
     * 
     * @param {Array} fields 
     */
    validate(fields) {
        return fields.map((field) => {
            const errors = [];
            
            field.validate.forEach((validate) => {
                let data = field.data;

                if (!!validate.mutate) {
                    switch (validate.mutate) {
                        case 'textContent':
                            data = this.htmlToText()
                        break;
                    }
                }

                switch(validate.type) {
                    case 'email':
                        if (!this.validateEmail(data))
                            errors.push(`${ field.name } not valid`)
                    break;
                    case 'min':
                        if (!(data.length >= validate.value))
                            errors.push(`${ field.name } too short value`)
                    break;
                    case 'max':
                        if (!(data.length <= validate.value))
                            errors.push(`${ field.name } too long value`)
                    break;
                    case 'enum':
                        if (validate.value.indexOf(data) < 0)
                            errors.push(`${ field.name } is not valid value`)
                    break;
                    case 'datatype':
                        if (typeof validate.value !== validate.type)
                            errors.push(`${ field.name } is not correct type`)
                    break;
                    case 'regex':
                        if (validate.value instanceof RegExp) {
                            if (!validate.value.test(data))
                                errors.push(`${ field.name } is not correct type`)
                        } else {
                            errors.push(`${ field.name } validation rule is not valid`)
                        }
                    break;
                }
            })

            field.valid = errors.length === 0;

            if (errors.length)
                field.errors = errors;

            return field;
        })
    }
}

module.exports = DB