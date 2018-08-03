const Path          = require('path');
const fs            = require('fs');
const express       = require('express');
const bodyParser    = require('body-parser');
const url           = require('url');
const socketIO      = require('socket.io');
const _             = require('lodash');

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
    })

    // io.on('connection', function(socket){
    //     debug('a user connected');
    // });
}

app.use(express.static(Path.join(Main.rootDir, 'public')))
app.use(bodyParser.json());

app.get('/api/requests', getAllRequests);
app.get('/api/requests/:id', getLatestRequests);
app.delete('/api/requests', deleteRequests);

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
    debug(req.body);
    var requestIDs = req.body.requests;
    var targets = Handler.data.remove('requests', (item)=>{
        return requestIDs.indexOf(item.id) > -1
    });
    res.send({status: true})
}
