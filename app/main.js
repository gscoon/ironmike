require('dotenv').config();

const {app, BrowserWindow} = require('electron');

const Path          = require('path');
const fs            = require('fs');
const moment        = require('moment');
const getPort       = require('get-port');
const Promise       = require('bluebird');

const Debug         = require('debug');

global.Main = {
    rootDir     : __dirname,
}

global.Config = require('./config.js');
global.Util = require('./util.js');
global.Handler = Util.getHandlers(Path.join(__dirname, 'handlers'));

require('electron-reload')(__dirname, {
    // Note that the path to electron may vary according to the main file
    electron: require(`${__dirname}/../node_modules/electron`)
});

var debug = Util.getDebugger('main');

let mainWindow;

module.exports = {
    start : start,
};

app.on('ready', start);

function start(config){
    config = config || {};

    debug('App: Starting...');

    mainWindow = new BrowserWindow({
        width   : 800,
        height  : 500,
        frame   : false
    });
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(`file://${__dirname}/frontend/index.html`);

    // config.routes = config.routes || [];

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

        // Handler.proxy.start(config);
        Handler.api.start(config.webPort)
        .then(launchWindow);
    })
}

function launchWindow(){
    mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        frame: false
    });
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(`file://${__dirname}/frontend/index.html`);
}
