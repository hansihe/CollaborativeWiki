var gulp = require('gulp');
var jsx = require('node-jsx');
var sourceMaps = require('gulp-sourcemaps');
var to5 = require('gulp-6to5');
var react = require('gulp-react');
var config = require('../config');

gulp.task('transforms', function() {
    //jsx.install({
    //    extension: '.js'
    //});
    return gulp.src(config.transform.src)
        .pipe(sourceMaps.init())
        .pipe(to5())
        .pipe(react())
        .pipe(sourceMaps.write('./'))
        .pipe(gulp.dest(config.transform.dest));
});