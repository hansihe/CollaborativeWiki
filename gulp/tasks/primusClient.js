var gulp = require('gulp');
var config = require('../config');
var gutil = require('gulp-util');

function string_src(filename, string) {
    var src = require('stream').Readable({objectMode: true});
    src._read = function() {
        this.push(new gutil.File({cwd: "", base: "", path: filename, contents: new Buffer(string)}));
        this.push(null);
    };
    return src;
};

gulp.task('primusClient', ['transforms'], function() {
    var primus = require('../../'+config.transform.dest+'/shared/primus');
    return string_src("primusClient.js", primus.makeClientLibrary())
        .pipe(gulp.dest(config.transform.dest+'/client'));
});
