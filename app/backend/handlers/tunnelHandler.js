const Tunnel        = require('reverse-tunnel-ssh');
const ssh2          = require('ssh2');
const moment        = require('moment');
const Path          = require('path');
const fs            = require('fs');
const _             = require('lodash');

var debug = Util.getDebugger('tunnel');

module.exports = {
    start       : startTunnel,
    // test connection
    check       : checkTunnel,
    getServers  : getServers,
    // check status
    get         : getTunnel,
}

var tunnel = {
    conn    : null,
    status  : false,
    config  : null
}

function startTunnel(config){
    debug("Tunnel: Opening remote port", config.remotePort);
    debug("Tunnel: Sending request to local port", config.proxyPort);

    var hasConnected = false;

    tunnel.config = config;
    var options = getOptions(config);
    debug(_.omit(options, ['privateKey']));
    return connect()

    function connect(){
        return new Promise((resolve, reject)=>{
            return clearRemotePort(options)
            .then(()=>{
                debug('Tunnel: Attempting to connect');
                tunnel.conn = Tunnel(options, (err, clientConnection) => {
                    debug("Tunnel - Response");
                    if(err)
                        return debug.error(err);
                });

                tunnel.conn.on('ready', ()=>{
                    debug('Tunnel: Started!!!!!!!')

                    tunnel.status = true;
                    hasConnected = true;
                    resolve();
                })

                tunnel.conn.on('error', (err) => {
                    tunnel.status = false;
                    debug.error("Tunnel error", err);
                    tunnel.conn.end();
                    connect();
                });

                tunnel.conn.on('forward-in', function (port) {
                    debug('Forwarding from remote port:' + port);
                });
            })
            .catch(reject)
        })
    }
}

function clearRemotePort(options){
    return new Promise((resolve, reject)=>{
        // first kill any existing services listening on port
        var conn = new ssh2.Client();

        var cmd = "kill $(lsof -t -i:" + options.dstPort +")";
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
            reject(err);
        })

        conn.connect(options)
    })
}

function getTunnel(){
    return _.pick(tunnel, ['status', 'config'])
}

function checkTunnel(remote){
    return new Promise((resolve, reject)=>{
        var conn = new ssh2.Client();
        var options = getOptions(remote);

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

    if(remote.identityFile)
        options.privateKey = fs.readFileSync(remote.identityFile, 'utf8');

    if(remote.password)
        options.password = remote.password;

    if(remote.remotePort)
        options.dstPort = parseInt(remote.remotePort);

    if(remote.proxyPort)
        options.srcPort = parseInt(remote.proxyPort);

    return options;
}

function getServers(){
    var homeDir = require('os').homedir();
    var sshDir = Path.join(homeDir, ".ssh");
    return parseSSHConfig(sshDir)
}

function parseSSHConfig(sshDir){
    sshDir = sshDir || Path.join(homeDir, ".ssh/");

    var configPath = Path.join(sshDir, 'config');
    var defaultKeyPath = Path.join(sshDir, 'id_rsa');

    var mapper = {
        'Host'          : 'title',
        'Port'          : 'port',
        'HostName'      : 'host',
        'User'          : 'username',
        'IdentityFile'  : 'identityFile'
    };

    if(!fs.existsSync(configPath))
        return Promise.resolve([]);

    var defaultKey = null;
    if(fs.existsSync(defaultKeyPath))
        defaultKey = defaultKeyPath;

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
                // set server defaults
                servers[currentServerIndex] = {
                    port            : 22,
                    identityFile    : defaultKey
                };
            }

            if(mapper[first])
                first = mapper[first];

            servers[currentServerIndex][first] = items.join(' ');
        })

        return servers;
    })

}
