# SOGITEK CONNEXION SERVERS MONITOR
This application monitors the connections being made in real time on the Sogiteck servers through connections to websocket javascript 'socketIO' and stores the received data in a database MongoDB data. You can connect to this service through the javascript plugin 'socketIO' or through PHP with the 'elephant.io' package (you can download an example of the latter plugin from the 'aux_files' folder).

This application has 2 parts: the "Nodejs" server and client in "angularjs". The NodeJS server has this servies: 

	1. HTTP: this service provides a monitor application web created in Angularjs.
	2. SocketIO: plugin for real-time connections.
	3. MongoDB: in the database MongoDB, 2 collections will be generated, one with the name of 'registers' (where are stored all data reaching the server for later retrieval and analysis), and another with the name 'servers' (which is saved the names of all the servers they connect to websocket reference to the client application).
	4. API: only for read information.

The AngularJS monitor application include 2 URL:

	1. Root "/": where you can view in real time any server connected to socketIO (all graphics are dynamically generated).

	2. "/filtrar": where you can filter out all stored informacicón servers (in mongodb) by date.

### Prerequisites:
	1. You have to be installed on your accommodation: 'git', 'nodejs', and a database 'mongodb'.

	2.- For connect to the websocket you need to send a field OBLIGATORY with the name 'serverName'

### Run server
0. download this projects from githup. You can use this command:
	git clone https://github.com/SOGITECK/angularjs-nodejs-realtime-server-monitor.git

1. later, open the "config.js" file and enter the appropriate parameters: you need to configure IP's both htpp server, such as the connection to the database MongoDB data; the "env" (environment) option accepts two values (string): 'development' or 'production'; the "adminRoom" field now don't has a very important use, simply put any name, but it has already implemented for future server upgrade.

2. you have to install all of the packages dependencies nodejs server (found in the 'package.json' file) by entering the following command console:

	npm install

3. Now, all is ok for run the app. If you use a linux, first make sure you have the ports to use empty. Threads list for port you will be using, and then kills the process if there:

	lsof -i tcp:80
	
	kill -9 num_PID

4. to start the server without dependence on the session, use the following command (in the debug.log you will have the business debugging code, and the errors.log you will have only the error for the aplication):

	nohup node app.js 1> debug.log 2> errors.log

### auxiliar files

In the 'aux_files' folder you can download a fully functional example of package php 'elephant.io' websocket to connect to the server service.

### For developers
In the 'socketio.js' file, on line 19, a global variable with the name 'localservers' that must be taken into account is used. This variable is used to go keeping the name servers in memory (in addition to saving in the database) and not have to be constantly making connections to the database to see if the incoming data is a new server or not.