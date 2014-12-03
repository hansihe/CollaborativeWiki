var gulp = require('gulp');
var webserver = require('gulp-webserver');
var config = require('../config').frontServer;

gulp.task('frontServer', ['browserify'], function() {
    gulp.src(config.directory)
        .pipe(webserver({
            open: false
        }))
});