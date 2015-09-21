'use strict';
var path = require('path');

// 1.- APP server whit AngularJS aplication and config for socket.io
var http = require(path.join(__dirname,'services','http'));

// 2.- API for send information to client from MongoDB
var api = require(path.join(__dirname,'services','api'));

// 3.- config websocket.io
var socketio = require(path.join(__dirname,'services','socketio'));

// 4.- config mongoose
var mongoose = require(path.join(__dirname,'services','mongoose'));
