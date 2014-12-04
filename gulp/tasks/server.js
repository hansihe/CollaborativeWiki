var gulp = require('gulp');
var config = require('../config').server;
var makeServer = require('../../src/server/main').makeServer;

gulp.task('server', ['browserify', 'transforms'], function() {
    var server = makeServer({});

    server.listen(config.port, function() {
        console.log('listening on *:' + config.port)
    })
});