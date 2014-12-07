var express = require('express');
var http = require('http');
var shoe = require('shoe');
var dnode = require('dnode');
var ot = require('ot');
var ServerStateManager = require('./ServerStateManager');
var path = require('path');
var _ = require('../shared/underscore');

exports.makeServer = function(config) {
    var app = express();
    var httpServer = http.Server(app);

    app.use('/static', express.static('./build/www'));

    app.get('*', function(req, res, next) {
        res.sendFile(path.resolve(__dirname + '../../../build/www/index.html'));
    });

    var sock = shoe(function(s) {
        new ServerStateManager(s);
    });
    sock.install(httpServer, '/endpoint');

    return httpServer;
};