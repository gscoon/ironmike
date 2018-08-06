const webpack   = require('webpack');
const Path      = require('path');
var base = Path.join(__dirname + '/../');
var paths = {
    src     : Path.join(base, '/app/frontend'),
    public  : Path.join(base, '/app/frontend/public'),
    styles  : Path.join(base, '/app/frontend/styles'),
}

module.exports = {
    entry   : {
        app: Path.join(paths.src, 'app.js')
    },
    output  : {
        path        : paths.public,
        publicPath  : '/',
        filename    : 'bundle.dev.js',
        sourceMapFilename: "./bundle.js.map",
        devtoolLineToLine: true,
    },
    devServer: {
        contentBase: paths.public,
        historyApiFallback: true,
    },
    module: {
        rules: [
            {
                test        : /\.(js|jsx)$/,
                exclude     : /node_modules/,
                include     :  paths.src,
                loader      : 'babel-loader',
            },
            {
                test        : /\.(scss|css)$/,
                // include     : paths.styles,
                loaders     : ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.(eot|woff|ttf|woff2|png|gif|jpeg|jpg|svg)$/,
                loader: "file-loader",
                options: {
                    outputPath: 'images/webpack/'
                }
            }
        ]
    }
}
