const Path          = require('path');
const fs            = require('fs');
const url           = require('url');
const moment        = require('moment');
const express       = require('express');
const bodyParser    = require('body-parser');
const _             = require('lodash');
const getPort       = require('get-port');
const axios         = require('axios');

var debug = Util.getDebugger('proxy');

module.exports = {
    start   : startProxy,
    stop    : stopProxy,
}

var http;
var routes;

function startProxy(config){
    return getPort()
    .then((port)=>{
        config.port = port;
        setProxy(config);
        return config;
    })
}

function stopProxy(){
    if(!http)
        return;

    debug('Stopping Proxy/HTTP connection');
    http.close();
}

function setProxy(config){
    debug("Set proxy", config)

    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    http = require('http').Server(app);

    http.listen(config.port, ()=>{
        debug('Proxy: Listening on port:', config.port);
    });

    routes = config.routes;
    app.use(processRequest);
}

function processRequest(req, res, next){
    storeRequest(req);

    if(!routes.length)
        return res.send({status: true})

    var firstMatch = null;

    // Request / Axios options
    var options = {
        headers     : req.headers,
        method      : req.method,
        data        : req.body,
        responseType:'stream'
    }

    routes.forEach((route)=>{
        if(!route) return;

        debug("URL:", url, route.urlMatch);
        debug("Destination:", route.destination);

        var proxyReq = axios(Object.assign(options, {url: route.destination}));

        if(firstMatch)
            return;

        firstMatch = true;

        proxyReq.then((proxyResponse)=>{
            // set response headers
            res.set(proxyResponse.headers);
            proxyResponse.data.pipe(res);
        })
    });

    if(!firstMatch)
        res.status(404).send({status: false});
}

function storeRequest(req){
    var rightNow = moment();
    var id = Util.genUID();

    var entry = _.pick(req, ['headers', 'body', 'hostname', 'protocol', 'query', 'method'])

    Object.assign(entry, {
        id              : id,
        url             : getFullURL(req, true),
        path            : req.url,
        timestamp       : rightNow.format(),
        unixTimestamp   : rightNow.unix(),
    });

    Handler.data.push('app.requests', entry);
}

function getFullURL(req, includeProtocol) {
    var proto = includeProtocol ? req.protocol : null;
    return url.format({
        host        : req.headers.host,
        pathname    : req.url,
        protocol    : proto,
    });
}
