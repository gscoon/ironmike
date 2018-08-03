const Path          = require('path');
const fs            = require('fs');
const Debug         = require('debug');
const moment        = require('moment');
const Promise       = require('bluebird');
const rimraf        = require('rimraf');
const glob          = require('glob');
const async         = require('async');
const mkdirp        = require('mkdirp');
const uuidv4        = require('uuid/v4');

module.exports = {
    genID               : genID,
    genUID              : genUID,
    wait                : wait,
    waitasec            : waitasec,
    waitRand            : waitRand,
    getDebugger         : getDebugger,
    getHandlers         : getHandlers,
    eachSeries          : eachSeries,
    glob                : customGlob,
    mkdirp              : customMkdirp,
    rimraf              : customRimraf,
}

function wait(len){
    return new Promise(function(resolve, reject){
        len = len || 0;
        setTimeout(function(){
            resolve();
        }, len)
    })
}

function waitasec(secs){
    return wait(secs * 1000);
}

function waitRand(min, max) {
	min = min || .5;
	max = max || 3;

	min = min * 1000;
	max = max * 1000;
	var rand = randomBetween(min, max); //Generate Random
	return Promise.delay(rand);
}


function eachSeries(arr, func, breakOnError){
    return new Promise((resolve, reject)=>{
        var ret = [];
        async.eachOfSeries(arr, (item, index, _next)=>{
            function next(err, data){
                data = data || null;
                _next(err);
                ret.push(data);
            }

            var P = func(item, index);
            if(!P || !P.then)
                P = Promise.resolve(P);

            P.then((data)=>{
                next(null, data);
            })
            .catch((err)=>{
                debug.error('Series error caught', err);
                if(breakOnError)
                    return next(err);

                return next();
            })
        }, (err)=>{
            if(err)
                return reject(err);

            resolve(ret);
        })
    })
}

function customGlob(matchStr, options){
    return new Promise((resolve, reject)=>{
        options = options || {};
        glob(matchStr, options, (err, files) => {
            if(err)
                return reject(err);

            return resolve(files);
        })
    })
}

function customMkdirp(dest){
    return new Promise((resolve, reject)=>{
        mkdirp(dest, (err)=>{
            if(err)
                return reject(err);

            resolve();
        })
    })
}

function customRimraf(f){
    return new Promise((resolve, reject)=>{
        rimraf(f, function(){
            resolve();
        })
    })
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

function genID(len) {
    len = len || 5;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function genUID(){
    return uuidv4();
}
