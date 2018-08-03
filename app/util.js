const Path          = require('path');
const fs            = require('fs');
const Debug         = require('debug');
const moment        = require('moment');

module.exports = {
    getDebugger     : getDebugger,
    getHandlers     : getHandlers,
}

function getDebugger(appendage){
    var key = "mike";
    var d = Debug([key, appendage].join(':'));
    d.err = Debug([key, appendage, 'error'].join(':'));
    d.error = Debug([key, appendage, 'error'].join(':'));
    return d;
}

// load all handlers in handlers dir
function getHandlers(hPath){
    const handlerTag = 'Handler';

    var files = fs.readdirSync(hPath);
    var handlers = {};
    files.forEach((f)=>{
        // only include those with Handler in the name
        if(f.indexOf(handlerTag) == -1)
            return;

        var handlerName = f.replace(handlerTag, '').replace('.js', '');
        handlers[handlerName] = require(Path.join(hPath, f));
    })
    return handlers;
}
