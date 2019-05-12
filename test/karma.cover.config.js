/**
 * karma cover config
 */
const base = require('./karma.base.config.js')

module.exports = function (config) {
    let options = Object.assign(base, {
        browsers: ['ChromeHeadless'],
        reporters: ['coverage'],
        coverageReporter: {
            type: 'html',
            dir: 'coverage/'
        },
        plugins: base.plugins.concat([
            'karma-coverage',
            'karma-chrome-launcher'
        ]),
        singleRun: true
    });

    options.webpack.module.rules[0].options = {
        plugins: [
            [
                'istanbul', 
                {
                    exclude: [
                        'test/'
                    ]
                }
            ]
        ]
    };

    config.set(options);
}