var webpackConfig = require('./webpack.test.js');

module.exports = function(config) {
  var _config = {
    basePath: '../',

    frameworks: ['jasmine'],

    // Files that Karma needs to know about; list of files / patterns to load
    // in the browser.
    files: [
      {
        pattern: './test-config/karma-test-shim.js',
        watched: true
      },
      {
        pattern: './src/assets/**/*',
        watched: false,
        included: false,
        served: true,
        nocache: false
      }
    ],

    proxies: {
      '/assets/': '/base/src/assets/'
    },

    preprocessors: {
      './test-config/karma-test-shim.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    },

    webpackServer: {
      noInfo: true
    },

    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
    },

    client: {
      captureConsole: true
    },

    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true
    },

    //logLevel: config.LOG_DEBUG,

    reporters: config.coverage ? ['kjhtml', 'progress', 'verbose', 'dots', 'coverage-istanbul'] :
      ['kjhtml', 'dots', 'progress', 'verbose'],

    port: 9876,

    colors: true,

    autoWatch: true,

    browsers: ['Chrome'],

    singleRun: true
  };

  config.set(_config);
};
