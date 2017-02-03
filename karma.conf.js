module.exports = function(config){
    config.set({

        basePath : './',

        logLevel: config.LOG_DEBUG,

        files : [
            'bower_components/jquery/dist/jquery.js',
            'jikit.debug.js',
            'jikit.spec.js'
        ],

        exclude : [
        ],

        reporters: ['progress', 'coverage'],

        preprocessors: {
            "jikit.js": ['coverage']
        },

        autoWatch : false,

        frameworks: ['jasmine'],

        browsers : ['PhantomJS'],

        plugins : [
            'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-coverage'
        ]
    });
};