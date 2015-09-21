'use stric';
var path = require('path');
var favicon = require('serve-favicon');
var df = require(path.join(__dirname,'..','library','dateFormat'));
var config = require(path.join(__dirname,'..','config.js'));
var env = config.env;
console.log("Environment: "+env);
var host = config[env].hostHTTP;
var port = config[env].portHTTP;

var express = require('express');
var app = express();
var serverHTTP = require('http')
    .createServer(app)
    .listen(port,host)
    .on('listening',function(){
        console.log(df.dateComplet()+" => HTTP service server LISTEN at "+host+":"+ port);
    })
    .on('error', function(err) {
        if (err.errno === 'EADDRINUSE') {
            console.error(df.dateComplet()+' ### HTTP ERROR: Port empty/working for another aplication '+ port);
        }else if (err.errno === 'EADDRNOTAVAIL'){
            console.error(df.dateComplet()+' ### HTTP ERROR: No correct IP '+host);
        }else{
            console.error(df.dateComplet()+' ### HTTP ERROR in listen: '+err);
        }
    }); // start http server for start running the websocket

// REDIRECTIONS HTTP
app.use(favicon(path.join(__dirname,'..','html','favicon.ico')));
app.use(express.static('html'));

app.use('/controller', express.static('/html/controller'));
app.use('/css', express.static('/html/css'));
app.use('/img', express.static('/html/img'));
app.use('/js', express.static('/html/js'));
app.use('/views', express.static('/html/views'));

// Impossible to control "http request" errors because
// the route control is customized by the client (AngularJS)

// export 'serverHTTP' for use in 'socketio'
// module.exports = serverHTTP;
exports.serverHTTP = serverHTTP; // for use in 'socketio'
exports.app = app; // for use in routes 'api'