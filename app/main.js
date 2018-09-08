const Path          = require('path');

require('dotenv').config({path: Path.join(__dirname, ".env")});

const electron      = require('electron');
const fs            = require('fs');
const moment        = require('moment');
const getPort       = require('get-port');
const Promise       = require('bluebird');
const connectClient = require('electron-connect').client;

const Debug         = require('debug');

const {app, BrowserWindow}  = electron;

global.Main = {
    rootDir     : __dirname,
    isMaximized : isMaximized,
    minimize    : minimize,
    maximize    : maximize,
    unmaximize  : unmaximize,
    hideWindow  : hideWindow,
    quit        : quit,
}

module.exports = {
    start : start,
};

global.Config   = require('./backend/config.js');
global.Util     = require('./util.js');
global.Handler  = Util.getHandlers(Path.join(__dirname, '/backend/handlers/'));

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

    if(Config.useConnect)
        connectClient.create(mainWindow);
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

function quit(){
    app.quit();
}
