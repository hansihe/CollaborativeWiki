var gulp = require('gulp');
var browserify = require('gulp-browserify');
var config = require('../config').browserify;

gulp.task('browserify', ['markup', 'sass', 'transforms'], function() {
    gulp.src(config.src)
        .pipe(browserify({
            transform: config.transform,
            insertGlobals: true,
            debug: config.debug
        }))
        .pipe(gulp.dest(config.dest))
});