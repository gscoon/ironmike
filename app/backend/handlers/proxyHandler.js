const Path          = require('path');
const fs            = require('fs');
const moment        = require('moment');
const express       = require('express');
const bodyParser    = require('body-parser');
const _             = require('lodash');
const getPort       = require('get-port');
const https         = require('https');
const URL           = require('url');

var debug = Util.getDebugger('proxy');

module.exports = {
    start   : startProxy,
    stop    : stopProxy,
    resend  : resendRequest,
}

const axios = require('axios').create({
    httpsAgent  : new https.Agent({
        rejectUnauthorized  : false
    })
});

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

    routes = config.routes || [];
    app.use(processRequest);
}

function processRequest(req, res, next){
    var fullURL = getFullURL(req);

    var destinations = [];

    // Request / Axios options
    var options = {
        headers     : req.headers,
        method      : req.method,
        data        : req.body,
        responseType: 'stream'
    }

    var appendage = req.url;

    routes.forEach((route)=>{
        if(!route) return;

        debug("Full URL:", fullURL, route.urlMatch);

        if(route.urlMatch && !fullURL.startsWith(route.urlMatch))
            return;

        var destination = URL.resolve(route.destination, appendage);
        debug("Destination:", destination);
        destinations.push(destination);

        var opts = Object.assign({url: destination}, options);
        var proxyReq = axios(opts);

        // There can be multiple destinations
        // Only return a response from the first destination

        if(destinations.length > 1)
            return;

        proxyReq.then((proxyResponse)=>{
            // set response headers
            res.set(proxyResponse.headers);
            proxyResponse.data.pipe(res);
        })
    });

    storeRequest(req, destinations);

    if(!destinations.length)
        res.status(404).send({status: false});
}

function storeRequest(req, destinations){
    var rightNow = moment();
    var id = Util.genUID();

    var entry = _.pick(req, ['headers', 'body', 'hostname', 'protocol', 'query', 'method'])

    Object.assign(entry, {
        id              : id,
        url             : getFullURL(req, true),
        path            : req.url,
        timestamp       : rightNow.format(),
        unixTimestamp   : rightNow.unix(),
        destinations    : destinations,
    });

    Handler.data.push('app.requests', entry);
}

function resendRequest(entry){
    debug("Resend:");
    debug(entry);

    var options  = {
        headers     : entry.headers,
        method      : entry.method,
        data        : entry.body,
    }

    var Ps = [];

    entry.destinations.forEach((destination)=>{
        var opts = Object.assign({url: destination}, options);
        var proxyReq = axios(opts);
        Ps.push(proxyReq);
    })

    return Promise.all(Ps);
}

function getFullURL(req, includeProtocol) {
    var proto = includeProtocol ? req.protocol : null;
    return URL.format({
        host        : req.headers.host,
        pathname    : req.url,
        protocol    : proto,
    });
}
