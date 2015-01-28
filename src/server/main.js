var express = require('express');
var http = require('http');
var shoe = require('shoe');
var dnode = require('dnode');
var ot = require('ot');
var ConnectionState = require('./ConnectionState');
var path = require('path');
var _ = require('../shared/underscore');

/* var ot = require('ot');
var o1 = ot.TextOperation.fromJSON(["1"]);
var o2 = ot.TextOperation.fromJSON([1, "5"]);
var o3 = ot.TextOperation.fromJSON([1, "8"]);

var no1 = ot.TextOperation.fromJSON([])

console.log(ot.TextOperation.transform(o2, o3)); */

exports.makeServer = function(config) {
    var app = express();
    var httpServer = http.Server(app);

    app.use('/static', express.static('./build/www'));

    app.get('*', function(req, res, next) {
        res.sendFile(path.resolve(__dirname + '../../../build/www/index.html'));
    });

    var sock = shoe(function(s) {
        new ConnectionState(s);
    });
    sock.install(httpServer, '/endpoint');

    return httpServer;
};