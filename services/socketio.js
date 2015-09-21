'use strict';
var path = require('path');
var df = require(path.join(__dirname,'..','library','dateFormat'));
var config = require(path.join(__dirname,'..','config.js'));
var adminRoom = config.adminRoom;
// CALL/REQUIRE the class/models create in 'mongoose'
var getModels = require(path.join(__dirname,'mongoose'));
var Registros = getModels.Registros;
var Servers = getModels.Servers;
// require 'serverHTTP' for connect the 'socketio'
var http = require(path.join(__dirname,'http'));
var serverHTTP = http.serverHTTP;

// listen is an alias of .attach(http)
var io = require('socket.io').listen(serverHTTP);
// DON'T HAVE "ON LISTEN..."
console.log(df.dateComplet()+" => WS service server LISTEN");

var localServers = [];
var query = {servers : { $exists: true} };
Servers.findOne(
    query,
    function(err, response) {
        if (err){
            console.error(df.dateComplet()+" ### ERROR in find SERVERS name array '$exists': ",err);
        }else{
            if (response === null) {
                Servers.create(
                    {servers : [] },
                    function(err, response) {
                        if (err){
                            console.error(df.dateComplet()+' ### ERROR at Create new Servers name array: '+err);
                        }else{
                            // send Server names array to the clients
                            //sendServerNames();
                            console.log(df.dateComplet()+" => SERVER array created");
                        }
                    }
                );
            }else{
                localServers = response.servers; // return array
                console.log(df.dateComplet()+" => Servers list download: "+localServers);
            }
        }
    }
);

io.sockets.on('connection', function(socket){
    var ip= socket.request.connection.remoteAddress;
    function messageSend(room,evento,data){

        io.to(room).emit(evento,data);
    }
    
    function recordServerName(server){
        var testLocalServers = localServers.indexOf(server);
        // -1 if no exists
        if (testLocalServers === -1){
            localServers.push(server);

            var query = {servers : { $exists: true} };
            Servers.findOne(
                query,
                function(err, response) {
                    if (err){
                        console.error(df.dateComplet()+" ### ERROR in find SERVERS name array '$exists': ",err);
                    }else{

                        response.servers.push(server);
                        var id = response._id;
                        Servers.update(
                            { _id : id },
                            { servers : response.servers},
                            function(err, response) {
                                if (err){
                                    console.error(df.dateComplet()+' ### ERROR at update SERVER name array: '+err);
                                }else{
                                    console.log(df.dateComplet()+" => SERVER name add: "+server+' with MongoDB response: '+response);
                                    //send to filter the name of the new SERVER
                                    messageSend(adminRoom,'newServer',server);
                                }
                            }
                        );
                    }
                }
            );

        }

        /*
        var query = {servers : { $exists: true} };
        Servers.findOne(
            query,
            function(err, response) {
                if (err){
                    console.error(df.dateComplet()+" ### ERROR in find SERVERS name array '$exists': ",err);
                }else{
                    if (response === null) {
                        Servers.create(
                            {servers : [server] },
                            function(err, response) {
                                if (err){
                                    console.error(df.dateComplet()+' ### ERROR at Create new Servers name array: '+err);
                                }else{
                                    // send Server names array to the clients
                                    //sendServerNames();
                                    console.log(df.dateComplet()+" => SERVER name add: "+response);
                                    //send to filter the name of the new SERVER
                                    messageSend(adminRoom,'newServer',server);
                                }
                            }
                        );
                    }else{
                        var keysServers = response.servers; // return array
                        var testName = keysServers.indexOf(server); // -1 if no exists
                        if (testName === -1){
                            response.servers.push(server);
                            var id = response._id;
                            Servers.update(
                                { _id : id },
                                { servers : response.servers},
                                function(err, response) {
                                    if (err){
                                        console.error(df.dateComplet()+' ### ERROR at update SERVER name array: '+err);
                                    }else{
                                        // send Server names array ti the clients
                                        //sendServerNames(); => IF NOT NECESARY
                                        console.log(df.dateComplet()+" => SERVER name add: "+response);
                                        //send to filter the name of the new SERVER
                                        messageSend(adminRoom,'newServer',server);
                                    }
                                }
                            );
                        }
                    }
                }
            }
        );*/
    }
    function sendServerNames(){
        var query = {servers : { $exists: true} };
        Servers.findOne(
            query,
            function(err, response) {
                if (err){
                    console.error(df.dateComplet()+' ### ERROR at recuperate SERVERS name array: '+err);
                }else{
                    if (response !== null) {
                        messageSend(adminRoom,'getservers', response.servers);
                    }else{
                        messageSend(adminRoom,'getservers', "There aren't SERVERS name in DDBB");
                        console.error(df.dateComplet()+' => "getservers" request: NULL');
                    }
                }
            }
        );
    }

    socket.on('addRoom', function (data) {
        socket.join(adminRoom); // join to room
        console.log(df.dateComplet()+" => New ADMIN in room "+adminRoom+" from "+ip);
        // sent to client the SERVERS name array        
        sendServerNames();
    });

    socket.on('envioPHP', function(data){
        if (data.date === undefined || data.date === "null" || data.date === "" || isNaN(data.date)) {
            data.date = new Date().getTime(); // ml seconds
        }

		var keysSchema = Object.keys(Registros.schema.paths); // array
		var keysData = Object.keys(data); // array
        //var server = data[keysData[0]]; // "Servidor01"
        var server = data.serverName; // "Servidor01"
        if (server !== undefined && server !== null) {

            for (var i = 0; i < keysData.length; i++) {
                var testName = keysSchema.indexOf(keysData[i]); // -1 if no exists
                if (testName === -1){
                    console.log(df.dateComplet()+" => add to Registros schema: '"+keysData[i]+"' from server: "+server);
                    var addSchema = {};
                    addSchema[keysData[i]] = 'number';
                    Registros.schema.add(addSchema);
                }
            }
            
            // test the serverName
            recordServerName(server);

            // save the register in DDBB 
            Registros
            .create(
                data,
                function(err, response) {
                    if (err){
                        console.error(df.dateComplet()+' ### ERROR at RECORD register in "envioPHP" socket event: '+err);
                    }else{
                        //console.log(df.dateComplet()+" => Correct record register: "+response);// 'response' return the create register
                    }
                }
            );
            // SEND data => room -   event   - data
            messageSend(adminRoom,'recivePHP', data);
            
        }else{
            console.error(df.dateComplet()+' ### ERROR no valid server name: '+data);
        }
    });

    socket.on('eixit',function(data){
        //console.log(df.dateComplet()+" => Socket ITSELF auto disconnected from "+ip);
        socket.disconnect();
    });

    socket.on('disconnect', function(){

        //console.log(df.dateComplet()+" => socket disconnected from "+ip);
    });
    
    socket.on('error', function (err) {
        if(err.message){
            console.error(df.dateComplet()+" => ### ERROR message in socket: "+err.message+'. From IP: '+socket.request.connection.remoteAddress);
            socket.disconnect();
        }else if(err.stack){
            console.error(df.dateComplet()+" => ### ERROR stack in socket: "+err.stack+'. From IP: '+socket.request.connection.remoteAddress);
            socket.disconnect();
        }else{
            console.error(df.dateComplet()+" => ### ERROR in socket from IP: "+socket.request.connection.remoteAddress);
            socket.disconnect();
        }
        //console.error(err.stack);
    });

});