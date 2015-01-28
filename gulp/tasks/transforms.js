var gulp = require('gulp');
var jsx = require('node-jsx');
var sourceMaps = require('gulp-sourcemaps');
var to5 = require('gulp-6to5');
var react = require('gulp-react');

gulp.task('transforms', function() {
    //jsx.install({
    //    extension: '.js'
    //});
    return gulp.src('src/**/*.js')
        .pipe(sourceMaps.init())
        .pipe(to5())
        .pipe(react())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest("build/js"));
});