module.exports = {
    context: __dirname + '/client',
    entry: './js/app.js',
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
            { test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] }
        ],
    },
    output: {
        filename: 'app.js',
        path: __dirname + '/dist',
    },
    devServer: {
        contentBase: __dirname + '/dist',
        compress: true,
        host: '192.168.1.50',
        port: 6961,
        disableHostCheck: true,
        proxy: {
            '/api/**': 'http://[::1]:6169'
        }
    },
    resolve: {
        extensions: [".wasm", ".ts", ".tsx", ".mjs", ".cjs", ".js", ".json"]
    },
    mode: 'development'
}
