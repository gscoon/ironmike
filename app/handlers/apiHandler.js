const express       = require('express');
const bodyParser    = require('body-parser');
const url           = require('url');

module.exports = {
    start : start
}

function start(){
    var app = express();
    app.use(handleReqs);
    return app;
}

function handleReqs(req, res, next){
    var key = req.headers['x-iron-mike'];
    if(!key)
        return next();

    bodyParser.json()(req, res, (err)=>{
        if(err)
            return next(err);

        switch(key){

        }
        res.send({status: true, data: req.body});
    })
}
