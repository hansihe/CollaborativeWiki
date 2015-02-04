var express = require('express');
var http = require('http');
var shoe = require('shoe');
var dnode = require('dnode');
var ot = require('ot');
var ConnectionState = require('./ConnectionState');
var path = require('path');
var _ = require('../shared/underscore');
var session = require('express-session');
var uuid = require('node-uuid');

exports.makeServer = function(config) {
    var app = express();
    var httpServer = http.Server(app);

    app.use('/static', express.static('./build/www'));
    /*app.use(session({
        genid: function(req) {
            return uuid.v4();
        },
        secret: 'changethis',
        resave: false,

    }));*/

    app.get('/api/auth', function(req, res, next) {
        res.send({woo: 'yes'});
    });

    app.get('*', function(req, res, next) {
        res.sendFile(path.resolve(__dirname + '../../../www/index.html'));
    });

    var sock = shoe(function(s) {
        new ConnectionState(s);
    });
    sock.install(httpServer, '/endpoint');

    return httpServer;
};