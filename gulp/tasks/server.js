var gulp = require('gulp');
var config = require('../config').server;

gulp.task('server', ['browserify', 'transforms'], function() {
    var makeServer = require('../../build/js/server/main').makeServer;
    var server = makeServer({});

    server.listen(config.port, function() {
        console.log('listening on *:' + config.port)
    })
});