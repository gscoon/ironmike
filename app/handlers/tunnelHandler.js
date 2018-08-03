const tunnel        = require('reverse-tunnel-ssh');
const ssh2          = require('ssh2');
const moment        = require('moment');
const Path          = require('path');
const fs            = require('fs');


module.exports = {
    start : startTunnel,
}

function startTunnel(config){
    var remote = config.remote;

    var debug = Util.getDebugger('tunnel');
    debug("Tunnel: Opening remote port", remote.listenPort);
    debug("Tunnel: Sending request to local port", config.port);

    var options = {
        host        : remote.host,
        username    : remote.username,
        // dstHost     : '0.0.0.0', // bind to all IPv4 interfaces
        dstPort     : remote.listenPort,
        privateKey  : remote.privateKey,
        //srcHost: '127.0.0.1', // default
        srcPort     : config.port // default is the same as dstPort
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
        var debug = Util.getDebugger('cleaner');

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
