var gulp = require('gulp');
var webserver = require('gulp-webserver');
var config = require('../config').frontServer;

gulp.task('frontServer', ['webpack'], function() {
    gulp.src(config.directory)
        .pipe(webserver({
            open: false
        }))
});