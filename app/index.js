require('dotenv').config();

const Path          = require('path');
const fs            = require('fs');
const moment        = require('moment');
const getPort       = require('get-port');
const Promise       = require('bluebird');

global.Util = require('./util.js');
global.Handler = Util.getHandlers(Path.join(__dirname, 'handlers'));

var debug = Util.getDebugger('main');

module.exports = {
    start : start,
};

function start(config){
    var debug = Util.getDebugger('start');
    debug('Starting...');

    config.routes = config.routes || [];

    var app = Handler.api.start()
    // find x free ports
    Promise.all([getPort(), getPort(), getPort()])
    .then((freePorts)=>{
        if(!config.port)
            config.port = freePorts.pop();

        if(!config.webPort)
            config.webPort = freePorts.pop();

        var endPort = freePorts.pop();

        Handler.tunnel.start(config);
        Handler.web.start(config, endPort);
        Handler.proxy.start(app, config.routes, endPort);
    })
}
