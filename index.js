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

var debug           = require('debug')('tunneler');

module.exports = start;

function start(config){
    debug('Starting...');


    config.routes = config.routes || [];

    var P = Promise.resolve(config.port);
    if(config.webPort)
        P = startWebClient(config.port, config.webPort);

    P.then((proxyPort)=>{
        debug("Proxy 2 port", proxyPort)
        startProxy(config.routes, proxyPort);
    })

    clearRemotePort(config.remote)
    .then(()=>{
        startTunnel(config.port, config.remote);
    })
}

function startProxy(routes, port){
    debug('Starting proxy...');

    var Proxy = rocky();
    Proxy.listen(port);

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

        return [src, dest]
    });

    var proxy = Proxy.all('/*');

    proxy
    .use((req, res, next)=>{
        var isMatch = false;
        for(var i = 0; i < routes.length; i++){
            var route = routes[0];
            if(!route) continue;
            req.rocky.options.replays = [];

            if(route[0] === true || fullURL(req).startsWith(route[0])){
                if(!req.doReplay)
                    req.rocky.options.target = route[1];
                else
                    req.rocky.options.replays.push(route[1]);

                req.doReplay = true;
                isMatch = true;
            }
        }

        next(!isMatch);
    })
}


function startWebClient(proxyPort, webPort){
    debug('Starting web client');

    return getPort()
    .then((proxy2Port)=>{
        var options = {
            port        : proxyPort,
            // rule    : require('myRuleModule'),
            webInterface: {
                enable      : true,
                webPort     : webPort
            },
            rule            : getRule(),
        };

        var webserver = new AnyProxy.ProxyServer(options);

        webserver.on('ready', () => {
            debug("Web client started");
        });
        webserver.on('error', (e) => {
            debug("Web client error");
        });

        webserver.start();

        function getRule(){
            return {
                summary             : 'The one',
                *beforeSendRequest(requestDetail){
                    var newOption = Object.assign({}, requestDetail.requestOptions);
                    newOption.hostname = 'localhost';
                    newOption.port = proxy2Port;
                    return {
                        requestOptions: newOption
                    };
                }
            }
        }

        return proxy2Port;
    })


}

function clearRemotePort(remote){
    return new Promise((resolve, reject)=>{
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

        conn.on('error', (err) => {
            debug("SSH2 error", err);
        })

        conn.connect({
            host        : remote.host,
            username    : remote.username,
            port        : remote.port || 22,
            privateKey  : remote.privateKey,
        })
    })
}

function startTunnel(localPort, remote){
    debug("Starting tunnel...");

    var conn = tunnel({
        host        : remote.host,
        username    : remote.username,
        // dstHost     : '0.0.0.0', // bind to all IPv4 interfaces
        dstPort     : remote.listenPort,
        privateKey  : remote.privateKey,
        //srcHost: '127.0.0.1', // default
        srcPort     : localPort // default is the same as dstPort
    }, (err, clientConnection) => {
        if(err)
            debug(err);
    });

    conn.on('error', (err) => {
        debug("Tunnel error", err);
    })
}

function fullURL(req) {
    return url.format({
        host: req.headers.host,
        pathname: req.url
    });
}
