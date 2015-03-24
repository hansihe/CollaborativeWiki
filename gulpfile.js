var gulp = require('gulp');
//var sass = require('node-sass');
//var reactify = require('reactify');

/*gulp.task('sass', function() {
    return gulp.src()
});

gulp.task('browserify', function () {
    var bundler = browserify({
        entries: ['./client/main.js'],
        transform: [reactify],
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true
    });
});**/

var requireDir = require('require-dir');

requireDir('./gulp/tasks', {recurse: true});
