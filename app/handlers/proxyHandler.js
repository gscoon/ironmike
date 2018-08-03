const Path          = require('path');
const fs            = require('fs');
const url           = require('url');
const rocky         = require('rocky');
const moment        = require('moment');
const express       = require('express');
const bodyParser    = require('body-parser');

var debug = Util.getDebugger('proxy');

module.exports = {
    start : startProxy,
}

function startProxy(routes, port){
    debug('Proxy 2: Attempting to start on port:', port);

    var proxy = rocky();

    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    var http = require('http').Server(app);

    http.listen(port, ()=>{
        debug('Proxy 2: Listening on port:', port);
    });

    app.use(proxy.middleware());

    routes = routes.map((route)=>{
        var src = true;
        var dest = false;

        if(Array.isArray(route)){
            return route;
        }
        else if(typeof route === 'string'){
            dest = route;
        }

        if(!dest) return false;

        return [src, dest];
    });

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

            if(route[0] === true || url.startsWith(route[0])){
                if(!isMatch)
                    req.rocky.options.target = route[1];
                else
                    req.rocky.options.replays.push(route[1]);

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

    var entry = {
        id              : id,
        headers         : req.headers,
        body            : req.body,
        url             : getFullURL(req, true),
        protocol        : req.protocol,
        method          : req.method,
        query           : req.query,
        timestamp       : rightNow.format(),
        unixTimestamp   : rightNow.unix(),
    };

    Handler.data.push('requests', entry);
}

function getFullURL(req, includeProtocol) {
    var proto = includeProtocol ? req.protocol : null;
    return url.format({
        host        : req.headers.host,
        pathname    : req.url,
        protocol    : proto,
    });
}
