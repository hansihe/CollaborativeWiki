var express = require('express');
var http = require('http');
var shoe = require('shoe');
var dnode = require('dnode');
var ot = require('ot');
var ClientContext = require('./ClientContext');

exports.makeServer = function(config) {
    var app = express();
    var httpServer = http.Server(app);

    app.use(express.static('./build/www'));

    var sock = shoe(function(s) {
        new ClientContext(s);
    });
    sock.install(httpServer, '/endpoint');

    return httpServer;
};