const mysql = require('mysql')
const sha256 = require('sha256')
const emailValidator = require('email-validator')
const sanitizeHtml = require('sanitize-html')

class DB {
    constructor(settings) {
        this.connection = mysql.createConnection(settings);
    }

    hash(string) {
        return sha256(string)
    }

    query() {
        //this.connection.connect();
        this.connection.query.apply(this.connection, arguments)
        //this.connection.end();
    }

    htmlToText(dirty) {
        return sanitizeHtml(dirty, { allowedTags: [] })
    }

    sanitize(dirty) {
        return sanitizeHtml(dirty)
    }

    validateEmail(email) {
        return emailValidator.validate(email);
    }

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