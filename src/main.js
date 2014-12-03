var express = require('express');
var http = require('http');
var shoe = require('shoe');
var dnode = require('dnode');
var ot = require('ot');
var ClientConnection = require('./clientContext');

exports.makeServer = function(config) {
    var app = express();
    var httpServer = http.Server(app);

    app.use(express.static('./build/www'));

    var sock = shoe(function(s) {
        new ClientConnection(s);
    });
    sock.install(httpServer, '/endpoint');

    var t = require('./redisClient');

    return httpServer;
};