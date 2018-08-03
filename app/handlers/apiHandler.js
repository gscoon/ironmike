const Path          = require('path');
const fs            = require('fs');
const express       = require('express');
const bodyParser    = require('body-parser');
const url           = require('url');
const socketIO      = require('socket.io');

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

app.all('*', (req, res)=>res.status(404).send({status: false, code: 404}));

function getAllRequests(req, res){
    var requests = Handler.data.get('requests');
    res.send({status: true, data: requests});
}

function getLatestRequests(req, res){
    res.send({status: true, id: req.params.id})
}
