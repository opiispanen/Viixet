const en = require('./en.js')
const fi = require('./fi.js')
const languages = {
    en,
    fi
}

const translate = (lang, placeholder) => {
    const activeLang = languages[lang] || {};
    
    if (!activeLang[placeholder]) {
        return placeholder;
    }

    return activeLang[placeholder];
}

module.exports = {
    translate
}