require('dotenv').config();

const Path          = require('path');
const tunnel        = require('reverse-tunnel-ssh');
const fs            = require('fs');
const ssh2          = require('ssh2');
const moment        = require('moment');
const AnyProxy      = require('anyproxy');
const rocky         = require('rocky');
const getPort       = require('get-port');
const url           = require('url');
const Promise       = require('bluebird');
const express       = require('express');
const Debug         = require('debug');

var debug           = getDebugger('main');

module.exports = start;

var freePorts;

function start(config){
    var debug = getDebugger('start');
    debug('Starting...');

    config.routes = config.routes || [];

    Promise.all([getPort(), getPort()])
    .then((_freePorts)=>{
        freePorts = _freePorts;

        if(config.port)
            return config.port;

        else freePorts.pop();
    })
    .then((proxyPort)=>{
        var endPort = freePorts.pop();
        startWebClient(proxyPort, config.webPort, endPort);
        startProxy(config.routes, endPort);
    })

    startTunnel(config);
}

function startProxy(routes, port){
    var debug = getDebugger('proxy');
    debug('Starting proxy on port:', port);

    var Proxy = rocky();

    var app = express();
    app.listen(port);
    app.use(Proxy.middleware());

    routes = routes.map((route)=>{
        var src = true;
        var dest = false;

        if(Array.isArray(route)){
            return route;
        }
        else if(typeof route === 'string'){
            dest = route;
        }

        if(!dest) return false;

        return [src, dest];
    });

    var proxy = Proxy.all('/*');

    proxy.use((req, res, next)=>{
        var url = fullURL(req);
        debug(req.method, url);

        if(!routes.length)
            return res.send({status: true})

        var isMatch = false;

        routes.forEach((route)=>{
            if(!route) return;

            req.rocky.options.replays = [];

            if(route[0] === true || url.startsWith(route[0])){
                if(!isMatch)
                    req.rocky.options.target = route[1];
                else
                    req.rocky.options.replays.push(route[1]);

                isMatch = true;
            }
        });

        if(isMatch)
            return next();

        res.status(404).send({status: false});
    })
}


function startWebClient(proxyPort, webPort, endPort){
    var debug = getDebugger('web');
    debug('Starting web client on port:', webPort);

    var options = {
        port        : proxyPort,
        webInterface: {
            enable      : true,
            webPort     : webPort
        },
        rule        : getRule(),
        silent      : true
    };

    var webserver = new AnyProxy.ProxyServer(options);

    webserver.on('ready', () => {
        debug("Web client started");
    });
    webserver.on('error', (e) => {
        debug.error("Web client error");
    });

    webserver.start();

    function getRule(){
        return {
            summary             : 'The one',
            *beforeSendRequest(requestDetail){
                var newOption = Object.assign({}, requestDetail.requestOptions);
                newOption.hostname = 'localhost';
                newOption.port = endPort;
                return {
                    requestOptions: newOption
                };
            }
        }
    }
}

function startTunnel(config){

    var localPort = config.port;
    var remote = config.remote;

    var debug = getDebugger('tunnel');
    debug("Starting tunnel...");

    var options = {
        host        : remote.host,
        username    : remote.username,
        // dstHost     : '0.0.0.0', // bind to all IPv4 interfaces
        dstPort     : remote.listenPort,
        privateKey  : remote.privateKey,
        //srcHost: '127.0.0.1', // default
        srcPort     : localPort // default is the same as dstPort
    };

    var conn;

    connect()
    .then(()=>{
        conn.on('error', (err) => {
            debug.error("Tunnel error", err);
            conn.end();
            connect();
        })
    })

    function connect(){
        return clearRemotePort(remote)
        .then(()=>{
            conn = tunnel(options, (err, clientConnection) => {
                if(err)
                    debug.error(err);
            });
        })
    }
}

function clearRemotePort(remote){
    return new Promise((resolve, reject)=>{
        var debug = getDebugger('cleaner');

        debug("Cleaning remote port...");

        // first kill any existing services listening on port
        var conn = new ssh2.Client();

        var cmd = "kill $(lsof -t -i:" + remote.listenPort +")";
        debug("Executing command", cmd);

        conn.on('ready', ()=>{
            conn.exec(cmd, (err, stream)=>{
                if(err){
                    conn.end();
                    return reject(err);
                }

                stream.on('close', (code, signal)=>{
                    resolve();
                    conn.end();
                })
                .on('data', (data)=>null)
                .stderr.on('data', (data)=>null)

            });
        });

        // disconnect and reconnet
        conn.on('error', (err) => {
            debug.error("SSH2 error", err);
        })

        conn.connect({
            host        : remote.host,
            username    : remote.username,
            port        : remote.port || 22,
            privateKey  : remote.privateKey,
        })
    })
}

function fullURL(req) {
    return url.format({
        host: req.headers.host,
        pathname: req.url
    });
}

function getDebugger(appendage){
    var key = "tunneler";
    var d = Debug([key, appendage].join(':'));
    d.err = Debug([key, appendage, 'error'].join(':'));
    d.error = Debug([key, appendage, 'error'].join(':'));
    return d;
}
