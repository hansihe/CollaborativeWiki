var gulp = require('gulp');
var jest = require('gulp-jest');
var config = require('../config');

gulp.task('test', ['transforms'], function() {
    return gulp.src(config.test.src).pipe(jest(config.test.options));
});