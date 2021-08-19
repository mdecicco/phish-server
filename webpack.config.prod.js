/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const keysTransformer = require('ts-transformer-keys/transformer').default;

module.exports = {
    entry: './src/index.tsx',
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(tsx|ts)?$/,
                loader: 'ts-loader',
                exclude: [/node_modules/, /tests/],
                options: {
                    getCustomTransformers: program => ({
                        before: [
                            keysTransformer(program)
                        ]
                    })
                }
            }, {
              test: /\.css$/,
              use: ['style-loader', 'css-loader']
            }
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        alias: {
            '@components': path.resolve(__dirname, 'src/components/'),
            '@pages': path.resolve(__dirname, 'src/pages/'),
            '@api': path.resolve(__dirname, 'src/api/'),
            '@utils': path.resolve(__dirname, 'src/utils/'),
            '@hooks': path.resolve(__dirname, 'src/hooks/'),
            '@constants': path.resolve(__dirname, 'src/constants'),
            '@types': path.resolve(__dirname, 'src/types')
        }
    },
    output: {
        filename: 'bundle.[contenthash].js',
        publicPath: '/',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve('./src/index.html')
        })
    ]
};