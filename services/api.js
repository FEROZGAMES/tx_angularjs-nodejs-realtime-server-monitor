'use strict';
var path = require('path');

var df = require(path.join(__dirname,'..','library','dateFormat'));
var config = require(path.join(__dirname,'..','config.js'));
var env = config.env;
var apiURLddbb = config[env].apiURLddbb;

// need variable 'app' for config the routes of the 'app'
var http = require(path.join(__dirname,'http'));
var app = http.app;

// CALL/REQUIRE the class/model create in 'mongoose'
var getModels = require(path.join(__dirname,'mongoose'));
var Registros = getModels.Registros;
var Servers = getModels.Servers;

// CRUD => READ (get)
app.get(apiURLddbb, function(req, res) {
    if(req.headers.server){
        var serverName = req.headers.server;
        var timein = req.headers.timein;
        var timefinish = req.headers.timefinish;
        // filtres => // gte >= for minim value  // lte <= for maxim value
        console.log("'GET' datos a filtrar: "+req.headers.server);
        Registros
            .find(
                {
                    'serverName': serverName,
                    'date': { $gte: timein, $lte: timefinish }
                },
                function(err, response) {
                    if (err){
                        res.send(err);
                        console.error(df.dateComplet()+' ### ERROR at read register GET/API: '+err);
                    }else{
                        //console.log(df.dateComplet()+" => Send registers: "+JSON.stringify(response));
                        res.json(response);// 'response' return all search registers
                    }
                }
            );
    }else{
        console.error(df.dateComplet()+' ### ERROR in GET/API: no exists "req.headers.server"');
    }
});

// CRUD => CREATE (post)
app.post(apiURLddbb, function(req, res) {
    Registros
        .create(
            {
                username : req.headers.username,
                ESTABLISHED: req.headers.established,
                LISTEN: req.headers.listen,
                mini: req.headers.mini,
                date: req.headers.hour
            },
            function(err, response) {
                if (err){
                    res.send(err);
                    console.error(df.dateComplet()+' ### ERROR at create register POST/API: '+err);
                }else{
                    console.log(df.dateComplet()+" => Correct record register: "+response);
                    res.json(response); // 'response' return the create register
                }
            }
        );
});

// CRUD => UPDATE
app.put(apiURLddbb, function(req, res) {
    if (req.headers._id){ // if exists the value "_id"...
        var data={}; // new object for update in the ddbb
        if(req.headers.username)data.username = req.headers.username;
        if(req.headers.established)data.ESTABLISHED = req.headers.established;
        if(req.headers.listen)data.LISTEN = req.headers.listen;
        if(req.headers.listen)data.mini = req.headers.mini;
        if(req.headers.listen)data.hour = req.headers.hour;
        //console.log("datos a actualizar: "+JSON.stringify(data));
        Registros
            .update(
                { _id : req.headers._id },
                data,
                function(err, response) {
                    if (err){
                        res.send(err);
                        console.error(df.dateComplet()+' ### ERROR at update register PUT/API: '+err);
                    }else{
                        console.log(df.dateComplet()+" => Modified register: "+response);
                        res.json(response); // 'response' return '1'
                    }
                }
            );
    } // end if => _id
});

// CRUD => DELETE
app.delete(apiURLddbb, function(req, res) {
    if (req.headers._id){
    //console.log("datos a borar: "+req.headers._id);
        Registros
            .remove(
                { _id : req.headers._id },
                function(err, response) {
                    if (err){
                        res.send(err);
                        console.error(df.dateComplet()+' ### ERROR at delete register DELETE/API: '+err);
                    }else{
                        console.log(df.dateComplet()+" => Delete register: "+response);
                        res.json(response); // 'response' return '1'
                    }
                }
            );
    }
    //console.log("datos a borar: NO HAN LLEGADO");
}); // end CRUD CONFIG

app.all('/*', function(req, res, next){
    var es = new Date();
    console.log(df.dateComplet()+' => HTTP request: "'+req.url+'", from IP '+req.ip+" with date "+es);
    res.sendFile(path.join(__dirname,'..','html','index.html'));
});// END REDIRECTIONS 