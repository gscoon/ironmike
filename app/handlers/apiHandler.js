const Path          = require('path');
const fs            = require('fs');
const express       = require('express');
const bodyParser    = require('body-parser');
const url           = require('url');
const socketIO      = require('socket.io');
const _             = require('lodash');
const opn           = require('opn');

var debug = Util.getDebugger('api');

const publicDir = Path.join(Main.rootDir, 'public/');

var app = express();
var apiPort;

module.exports = {
    start               : start,
    getHost             : getHost,
    getAllRequests      : getAllRequests,
    getLatestRequests   : getLatestRequests,
    deleteRequests      : deleteRequests,
    getServers          : getServers,
    checkTunnel         : checkTunnel,
    setTunnel           : setTunnel,
    getTunnel           : getTunnel,
    setProxy            : setProxy,
}

app.use(customMiddleware);
app.use(express.static(publicDir, {extensions:['html']}));
app.use(bodyParser.json());

// Requests
app.get('/api/requests', rh.bind(getAllRequests));
app.get('/api/requests/:id', rh.bind(getLatestRequests));
app.delete('/api/requests', rh.bind(deleteRequests));

// Servers
app.get('/api/servers', rh.bind(getServers));

// // Ports
// app.get('/api/proxy', rh.bind(getAllServers));

// Tunnel
app.post('/api/tunnel/check', rh.bind(checkTunnel));
app.post('/api/tunnel', rh.bind(setTunnel));
app.get('/api/tunnel', rh.bind(getTunnel));

// Proxy
app.post('/api/proxy', rh.bind(setProxy));

app.all('*', (req, res)=>res.status(404).send({status: false, code: 404}));

// requestHandler
function rh(req, res){
    var func = this;
    var body = req.body || {};
    var query = req.query || {};
    var params = req.params || {};

    var data = Object.assign({}, query, params, body);

    var P = func(data);
    if(!P.then)
        P = Promise.resolve(P);

    P.then((response)=>{
        response = response || {};
        res.send(Object.assign({status: true}, response));
    })
    .catch((err)=>{
        res.status(400).send({status: false, error: err});
    })
}

function setProxy(data){
    return Handler.proxy.start(data)
}

function getAllRequests(body){
    var requests = Handler.data.get('app.requests');
    requests = _.orderBy(requests, ['unixTimestamp'], ['desc']);
    return Promise.resolve({data: requests});
}

function getLatestRequests(body){
    var requests = Handler.data.get('app.requests');
    requests = _.orderBy(requests, ['unixTimestamp'], ['desc']);
    var latestID = body.id;
    debug('Getting latest', body);
    var item = _.find(requests, {id: latestID});

    if(!item)
        return Promise.reject('Item not found');

    var data = requests.filter((entry)=>{
        return entry.unixTimestamp > item.unixTimestamp
    })

    return Promise.resolve({data: data})
}

function deleteRequests(body){
    var requestIDs = body.requests;
    Handler.data.remove('app.requests', (item)=>{
        return requestIDs.indexOf(item.id) > -1
    });
    return Promise.resolve();
}

function getServers(body){
    return Handler.tunnel.getServers()
    .then((servers)=>{
        return {servers: servers};
    })
}

function checkTunnel(body){
    return Handler.tunnel.check(body)
}

function getTunnel(body){
    var tunnel = Handler.tunnel.get()
    return tunnel
}

function setTunnel(body){
    var remote = Handler.data.get('app.activeSSH');
    if(!remote)
        return Promise.reject('Missing active SSH');

    Object.assign(remote, body)
    return Handler.tunnel.start(remote);
}

function getHost(){
    return "http://localhost:"+apiPort
}

function start(port){
    return new Promise((resolve, reject)=>{
        apiPort = port;
        var http = require('http').Server(app);
        var io = socketIO(http);

        http.listen(port, (err)=>{
            if(err)
                return reject(err);

            debug('API: listening to port', port);
            // opn('http://localhost:' + port);
            resolve();
        })

        // io.on('connection', function(socket){
        //     debug('a user connected');
        // });
    })
}

function customMiddleware(req,res,next){
    debug("Request :::", process.env.NODE_ENV, Config.isDev, req.method, req.url);
    if(req.url === '/' && Config.isDev)
        return res.redirect('/dev');

    next();
}
