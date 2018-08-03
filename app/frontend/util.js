import uuidv4 from 'uuid/v4';

module.exports = {
    genID               : genID,
    genUID              : genUID,
    wait                : wait,
    waitasec            : waitasec,
    waitRand            : waitRand,
    // requests
    fetch               : customFetch,
    post                : customPost,
    del                 : customDel,
}

function customFetch(url){
    return fetch(url)
    .then(function(response) {
        return response.json();
    })
}

function customPost(url, data){
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
}

function customDel(url, data){
    return fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
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
	return wait(rand);
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
