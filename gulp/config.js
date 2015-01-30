var dest = "./build";
var wwwDest = dest + "/www";
var src = "./src";

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
    webpack: {
        src: dest + "/js/main.js",
        dest: wwwDest,
        debug: true,
        devtool: '#source-map',
        plugins: [
            //new webpack.optimize.UglifyJsPlugin()
        ],
        entry: {
            main: './build/js/client/main.js'
        },
        output: {
            filename: './main.js'
        }
    },
    transform: {
        src: src + "/**/*.js",
        dest: dest + "/js"
    },
    markup: {
        src: src + "/client/html/*.html",
        dest: wwwDest
    }
};