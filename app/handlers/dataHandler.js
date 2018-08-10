const homedir       = require('os').homedir();
const Path          = require('path');
const fs            = require('fs');
const low           = require('lowdb');
const FileAsync     = require('lowdb/adapters/FileAsync');
const Bottleneck    = require('bottleneck');
const moment        = require('moment');

// new Bottleneck(maxConcurrent, minTime, highWater, strategy, rejectOnDrop);
var debug = Util.getDebugger('db');
var writeLimiter = new Bottleneck(1, 0, -1);
var db;

module.exports = {
    start       : start,
    get         : getData,
    set         : setData,
    updateArr   : updateArrData,
    push        : pushData,
    remove      : removeData,
    update      : updateData,
    getAppData  : getAppData,
}

function start(){
    return Util.mkdirp(Config.paths.appData)
    .then(()=>{
        const adapter = new FileAsync(Config.paths.db);
        return low(adapter)
    })
    .then((_db)=>{
        debug('DB: Started...')
        db = _db;
        db.defaults(getDefaults()).write()
    })
}

function getDefaults(){
    return {
        app : {
            requests : [],
        }
    }
}

function getData(key, filter){
    var ret = db.get(key);
    if(filter)
        ret = ret.filter(filter);

    return ret.value();
}

function setData(key, data, preventBlast){
    return write(db.set(key, data), preventBlast);
}

function updateArrData(key, filter, data, preventBlast){
    return write(db.get(key).find(filter).assign(data), preventBlast);
}

function updateData(key, data, preventBlast){
    return write(db.get(key).assign(data), preventBlast);
}

function pushData(key, data, preventBlast){
    return write(db.get(key).push(data), preventBlast);
}

function removeData(key, filter, preventBlast){
    return write(db.get(key).remove(filter), preventBlast);
}

function getAppData(){
    return db.get(appKey).value();
}

// encrypt and save
function write(chain, preventBlast){
    var writeID = Util.genID(5);
    debug("DB Write: called", writeID);
    chain.value(); // sets value
    return writeLimiter.schedule(doWrite);

    function doWrite(){
        var modifiedTime = moment().format();
        debug("DB Write: written", modifiedTime, writeID);
        db.set('lastModified', modifiedTime).value();

        return db.write()
        .then(function(){
            // var appData = getAppData();
        })
    }
}
