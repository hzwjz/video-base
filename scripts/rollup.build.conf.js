/**
 * rollup build config
 */
const path = require('path');
const version = require('../package.json').version;
const resolvePlugin = require('rollup-plugin-node-resolve');
const commonjsPlugin = require('rollup-plugin-commonjs');

const resolve = p => { return path.join(__dirname, '../', p);}

const banner = 
    '/*!\n' +
    ` * Vido-base v${version}\n` +
    ' */';

module.exports = {
    input: resolve('src/index.js'),
    output: {
        file: resolve('dist/video-base.esm.js'),
        format: 'es',
        banner
    },
    plugins: [
        commonjsPlugin(),
        resolvePlugin({
            preferBuiltins: false
        })
    ]
};