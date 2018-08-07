const Path          = require('path');
const fs            = require('fs');
const express       = require('express');
const bodyParser    = require('body-parser');
const favicon       = require('serve-favicon');
const url           = require('url');
const socketIO      = require('socket.io');
const _             = require('lodash');
const opn           = require('opn');

var debug = Util.getDebugger('api');

module.exports = {
    start : start
}

var app = express();

function start(port){
    var http = require('http').Server(app);
    var io = socketIO(http);

    http.listen(port, ()=>{
        debug('API: listening to port', port);
        // opn('http://localhost:' + port);
    })

    // io.on('connection', function(socket){
    //     debug('a user connected');
    // });
}

var publicDir = Path.join(Main.rootDir, 'frontend/public/');

app.use(express.static(publicDir, {extensions:['html']}));
app.use(bodyParser.json());
app.use(favicon(Path.join(publicDir, 'images/favicon/favicon-32x32.png')));
// app.use((req, res, next)=>{
//     debug("Request :::", req.method, req.url);
//     next();
// })

// Requests
app.get('/api/requests', getAllRequests);
app.get('/api/requests/:id', getLatestRequests);
app.delete('/api/requests', deleteRequests);

// Servers
app.get('/api/servers', getAllServers);

app.all('*', (req, res)=>res.status(404).send({status: false, code: 404}));

function getAllRequests(req, res){
    var requests = Handler.data.get('requests');
    requests = _.orderBy(requests, ['unixTimestamp'], ['desc']);
    res.send({status: true, data: requests});
}

function getLatestRequests(req, res){
    var requests = Handler.data.get('requests');
    requests = _.orderBy(requests, ['unixTimestamp'], ['desc']);
    var latestID = req.params.id;
    var item = _.find(requests, {id: latestID});

    if(!item)
        return res.send({status: false});

    var data = requests.filter((entry)=>{
        return entry.unixTimestamp > item.unixTimestamp
    })

    res.send({status: true, data: data})
}

function deleteRequests(req, res){
    var requestIDs = req.body.requests;
    Handler.data.remove('requests', (item)=>{
        return requestIDs.indexOf(item.id) > -1
    });
    res.send({status: true})
}

function getAllServers(req, res){
    var homeDir = require('os').homedir();
    var configPath = Path.join(homeDir, ".ssh/config");

    Util.parseSSHConfig(configPath)
    .then((servers)=>{
        return res.send({status: true, servers: servers});
    })

}
