const Path          = require('path');
const fs            = require('fs');
const url           = require('url');
const rocky         = require('rocky');
const moment        = require('moment');

module.exports = {
    start : startProxy,
}

function startProxy(app, routes, port){
    var debug = Util.getDebugger('proxy');
    debug('Proxy 2: Attempting to start on port:', port);

    var proxy = rocky();

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
        var url = fullURL(req);
        debug(req.method, url);
        debug(req.body);

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


function fullURL(req) {
    return url.format({
        host: req.headers.host,
        pathname: req.url
    });
}
