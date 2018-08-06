require('dotenv').config();

const Path          = require('path');
const fs            = require('fs');
const moment        = require('moment');
const getPort       = require('get-port');
const Promise       = require('bluebird');

global.Main = {
    rootDir     : __dirname,
}

global.Config = require('./config.js');
global.Util = require('./util.js');
global.Handler = Util.getHandlers(Path.join(__dirname, 'handlers'));

var debug = Util.getDebugger('main');

module.exports = {
    start : start,
};

function start(config){
    var debug = Util.getDebugger('start');
    debug('App: Starting...');

    config.routes = config.routes || [];

    // find x free ports
    Handler.data.start()
    .then(()=>{
        return Promise.all([getPort(), getPort(), getPort()])
    })
    .then((freePorts)=>{
        if(!config.port)
            config.port = freePorts.pop();

        if(!config.webPort)
            config.webPort = freePorts.pop();

        if(config.remote)
            Handler.tunnel.start(config);
            
        Handler.proxy.start(config);
        Handler.api.start(config.webPort);
    })
}
