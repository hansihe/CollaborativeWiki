var dest = "./build";
var wwwDest = dest + "/www";
var src = "./src";

var reactify = require('reactify');

module.exports = {
    server: {
        port: 8080,
        staticLocation: wwwDest,
        defaultFile: 'index.html'
    },
    frontServer: {
        directory: wwwDest
    },
    sass: {
        src: src + "/client/sass/**.scss",
        dest: wwwDest
    },
    browserify: {
        src: src + "/client/main.js",
        dest: wwwDest,
        transform: [reactify],
        debug: true
    },
    markup: {
        src: src + "/client/html/*.html",
        dest: wwwDest
    }
};