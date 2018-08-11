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

var handlerDir = Path.join(__dirname, '/handlers/');
global.Handler = Util.getHandlers(handlerDir);

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

function start(){
    debug('App: Starting...');
    // find x free ports
    Handler.data.start()
    .then(getPort)
    .then(Handler.api.start)
    .then(launchWindow)
}

function launchWindow(){
    mainWindow = new BrowserWindow({
        width   : 800,
        height  : 600,
        frame   : false
    });
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(`file://${__dirname}/frontend/index.html`);
}
