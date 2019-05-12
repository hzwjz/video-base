/**
 * karma dev config
 */
const base = require('./karma.base.config.js')

module.exports = function (config) {
    config.set(Object.assign(base, {
        browsers: ['ChromeHeadless'],
        plugins: base.plugins.concat([
            'karma-chrome-launcher'
        ])
    }))
}