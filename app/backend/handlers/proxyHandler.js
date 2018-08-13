const Path          = require('path');
const fs            = require('fs');
const url           = require('url');
const rocky         = require('rocky');
const moment        = require('moment');
const express       = require('express');
const bodyParser    = require('body-parser');
const _             = require('lodash');
const getPort       = require('get-port');

var debug = Util.getDebugger('proxy');

module.exports = {
    start : startProxy,
}

function startProxy(config){
    return getPort()
    .then((port)=>{
        config.port = port;
        setProxy(config);
        return config;
    })
}

function setProxy(config){
    debug("Set proxy", config)
    var proxy = rocky();
    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    var http = require('http').Server(app);

    http.listen(config.port, ()=>{
        debug('Proxy: Listening on port:', config.port);
    });

    app.use(proxy.middleware());

    var routes = config.routes;

    var proxyRoute = proxy.all('/*');

    proxyRoute.use((req, res, next)=>{
        var url = getFullURL(req);

        processRequest(req);

        if(!routes.length)
            return res.send({status: true})

        var isMatch = false;

        routes.forEach((route)=>{
            if(!route) return;

            req.rocky.options.replays = [];

            if(!route.urlMatch || url.startsWith(route.urlMatch)){
                if(!isMatch)
                    req.rocky.options.target = route.destination;
                else
                    req.rocky.options.replays.push(route.destination);

                isMatch = true;
            }
        });

        if(isMatch)
            return next();

        res.status(404).send({status: false});
    })
}

function processRequest(req){
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
