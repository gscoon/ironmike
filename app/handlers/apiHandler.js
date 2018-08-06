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
