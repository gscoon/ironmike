const webpack   = require('webpack');
const Path      = require('path');

var paths = {
    public  : Path.join(__dirname + '/app/public'),
    src     : Path.join(__dirname + '/app/frontend'),
}

module.exports = {
    entry   : {
        app: Path.join(paths.src, 'app.js')
    },
    output  : {
        path        : paths.public,
        publicPath  : '/',
        filename    : 'bundle.js'
    },
    devServer: {
        contentBase: paths.public,
        historyApiFallback: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.scss/,
                // include: paths.src,
                loaders: ["style-loader", "css-loader?modules"]
            }
        ]
    }
}
