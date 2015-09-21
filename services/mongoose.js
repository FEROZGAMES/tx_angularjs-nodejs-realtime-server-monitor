'use stric';
var path = require('path');
var df = require(path.join(__dirname,'..','library','dateFormat'));
var config = require(path.join(__dirname,'..','config.js'));
var env = config.env;
var dbConnect = config[env].dbConnect;

var mongoose = require('mongoose')
    .connect(dbConnect);
var db = mongoose.connection
    .on('error',function(err){
        console.error(df.dateComplet()+' ### DDBB connection'+err);
    })
    .once('open', function (callback) {
        console.log(df.dateComplet()+" => Mongoose connect at: "+dbConnect);
    });

// SCHEMA - MODEL
// types: String Number Date Buffer Boolean Mixed Objectid Array 
var registrosSchema = mongoose.Schema({
    serverName : String
});
// CONSTRUCTOR/CLASS => MODEL('collection-table',schema)
var Registros = mongoose.model('registers', registrosSchema);
console.log(df.dateComplet()+' => Create Mongoose class "Registros" for collection-table "registros"');

// SCHEMA - MODEL
// types: String Number Date Buffer Boolean Mixed Objectid Array 
var serversSchema = mongoose.Schema({
    servers : Array
});
// CONSTRUCTOR/CLASS => MODEL('collection-table',schema)
var Servers = mongoose.model('servers', serversSchema);
console.log(df.dateComplet()+' => Create Mongoose class "Servers" for collection-table "registros"');

// export the CONSTRUCTOR/CLASS/ MODEL
// for use in the ROUTERS/API.JS (monitor test app)
// for use in the SOCKETIO.JS for save the data (from PHP servers)
//module.exports = Registros;
exports.Registros = Registros;
exports.Servers = Servers;