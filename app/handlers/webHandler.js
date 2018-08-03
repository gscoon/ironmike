const AnyProxy      = require('anyproxy');
const Path          = require('path');
const fs            = require('fs');

module.exports = {
    start : startWebClient
}

function startWebClient(config, endPort){
    var debug = Util.getDebugger('web');
    debug('Web Client: Starting web client on port:', config.webPort);
    debug('Proxy 1: Starting on port:', config.port);

    var options = {
        port        : config.port,
        webInterface: {
            enable      : true,
            webPort     : config.webPort
        },
        rule        : getRule(),
        silent      : true
    };

    var webserver = new AnyProxy.ProxyServer(options);

    webserver.on('ready', () => {
        debug("Web Client: Started");
    });
    webserver.on('error', (e) => {
        debug.error("Web Client: Error");
    });

    webserver.start();

    function getRule(){
        return {
            summary             : 'The one',
            *beforeSendRequest(requestDetail){
                var newOption = Object.assign({}, requestDetail.requestOptions);
                newOption.hostname = 'localhost';
                newOption.port = endPort;
                return {
                    requestOptions: newOption
                };
            }
        }
    }
}
