var gulp = require('gulp');
var jsx = require('node-jsx');

gulp.task('transforms', function() {
    jsx.install({
        extension: '.jsx'
    })
});