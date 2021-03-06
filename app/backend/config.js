const Path          = require('path');
const fs            = require('fs');
const homedir       = require('os').homedir();
const appKey        = 'ironmike';
const appData       = Path.join(homedir, '.' + appKey);

module.exports = {
    paths   : {
        home    : homedir,
        appData : appData,
        db      : Path.join(appData, 'db.json')
    },
    isDev   : process.env.NODE_ENV === 'development',
    useConnect  : process.env.USE_CONNECT ? true : false,
}
