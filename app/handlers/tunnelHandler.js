const tunnel        = require('reverse-tunnel-ssh');
const ssh2          = require('ssh2');
const moment        = require('moment');
const Path          = require('path');
const fs            = require('fs');

var debug = Util.getDebugger('tunnel');

module.exports = {
    start       : startTunnel,
    check       : checkTunnel,
    getServers  : getServers,
}

function startTunnel(config){
    var remote = config.remote;

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
        // first kill any existing services listening on port
        var conn = new ssh2.Client();

        var cmd = "kill $(lsof -t -i:" + remote.listenPort +")";
        // debug("Executing command", cmd);

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

function checkTunnel(remote){
    return new Promise((resolve, reject)=>{
        var conn = new ssh2.Client();
        var options = getOptions(remote);
        debug(options);
        conn.connect(options)

        conn.on('error', (err) => {
            return reject(err);
        })

        conn.on('ready', ()=>{
            resolve();
            conn.end();
        });
    })
}

function getOptions(remote){
    var options = {
        host        : remote.host,
        username    : remote.username,
        port        : remote.port || 22,
    };

    if(remote.privateKey)
        options.privateKey;

    if(remote.password)
        options.password = remote.password;

    return options;
}

function getServers(){
    var homeDir = require('os').homedir();
    var configPath = Path.join(homeDir, ".ssh/config");
    return parseSSHConfig(configPath)
}

function parseSSHConfig(configPath){
    configPath = configPath || Path.join(homeDir, ".ssh/config");
    var mapper = {
        'Host'      : 'title',
        'Port'      : 'port',
        'HostName'  : 'host',
        'User'      : 'username',
    };

    if(!fs.existsSync(configPath))
        return Promise.resolve([]);

    return Util.readFile(configPath, 'utf8')
    .then((data)=>{
        var rows = data.split('\n');
        var servers = [];
        var currentServerIndex = -1;

        rows.forEach((row)=>{
            row = row.trim();
            if(!row) return;
            var items = row.split(' ');
            var first = items.splice(0,1)[0];
            if(first === 'Host'){
                currentServerIndex++;
                servers[currentServerIndex] = {
                    port : 22
                };
            }

            if(mapper[first])
                first = mapper[first];

            servers[currentServerIndex][first] = items.join(' ');
        })

        return servers;
    })

}
