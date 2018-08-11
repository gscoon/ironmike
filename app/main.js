require('dotenv').config();

const electron      = require('electron');
const Path          = require('path');
const fs            = require('fs');
const moment        = require('moment');
const getPort       = require('get-port');
const Promise       = require('bluebird');

const Debug         = require('debug');

const {app, BrowserWindow}  = electron;

global.Main = {
    rootDir     : __dirname,
    isMaximized : isMaximized,
    minimize    : minimize,
    maximize    : maximize,
    unmaximize  : unmaximize,
    hideWindow  : hideWindow,
}

module.exports = {
    start : start,
};

global.Config   = require('./config.js');
global.Util     = require('./util.js');
global.Handler  = Util.getHandlers(Path.join(__dirname, '/handlers/'));

require('electron-reload')(__dirname, {
    // Note that the path to electron may vary according to the main file
    electron: require(`${__dirname}/../node_modules/electron`)
});

var debug = Util.getDebugger('main');

let mainWindow;

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

function isMaximized(){
    var winBounds = mainWindow.getBounds();
    var disp = electron.screen.getDisplayMatching(winBounds);
    var x = winBounds.x - disp.bounds.x;
    var y = winBounds.y - disp.bounds.y;
    return x <= y;
}

function minimize(){
    BrowserWindow.getFocusedWindow().minimize();
}

function hideWindow(){
    BrowserWindow.getFocusedWindow().hide();
}

function maximize(){
    BrowserWindow.getFocusedWindow().maximize();
}

function unmaximize(){
    BrowserWindow.getFocusedWindow().unmaximize();
}
