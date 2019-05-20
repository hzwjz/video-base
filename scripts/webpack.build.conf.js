/**
 * webpack build config
 */
const path = require('path');
const webpack = require('webpack');
const TerserJSPlugin = require("terser-webpack-plugin");
const resolve = dir => path.join(__dirname, '../', dir)

module.exports = {
    mode: 'production',

    entry: {
        'vue-video-player': path.join(__dirname, '../src/index.js')
    },

    externals: {
        
    },
      
    output: {
        path: resolve('dist'),
        publicPath: '/',
        filename: '[name].js',
        library: 'VideoBase',
        libraryTarget: 'umd'
    },

    devtool: '#source-map',

    resolve: {
        extensions: ['.js', '.json'],
        modules: [
            resolve('src'),
            resolve('node_modules')
        ]
    },

    optimization: {
        minimizer: [
            new TerserJSPlugin()
        ]
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    resolve('src'), 
                    resolve('test')
                ]
            }
        ]
    },

    plugins: [
        
    ]
};
