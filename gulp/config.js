var dest = "./build";
var wwwDest = dest + "/www";
var src = "./src";
var webpack = require('webpack');

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
        src: dest + "/js/",
        //src: src,
        dest: wwwDest,
        debug: true,
        devtool: '#source-map',
       /* module: {
            loaders: [
                {
                    loader: '6to5-loader',
                    exclude: /node_modules/
                },
                {
                    loader: 'jsx-loader',
                    exclude: /node_modules/,
                    sourceMap: true
                }
            ]
        }, */
        plugins: [
            //new webpack.optimize.UglifyJsPlugin()
        ],
        entry: {
            main: './build/js/client/main.js'
            //main: './src/client/main.js'
        },
        output: {
            filename: './main.js'
        }
    },
    transform: {
        src: src + "/**/*.js",
        dest: dest + "/js"
    },
    test: {
        src: dest + "/js",
        options: {
            testPathIgnorePatterns: [
                "node_modules"
            ]
        }
    },
    markup: {
        src: src + "/client/html/*.html",
        dest: wwwDest
    }
};