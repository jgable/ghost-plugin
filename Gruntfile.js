'use strict';

module.exports = function (grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var cfg = {
        jshint2: {
            options: {
                jshintrc: '.jshintrc'
            },

            example: ['example/kudos/index.js'],

            lib: ['index.js', 'Gruntfile.js', 'lib/**/*.js'],

            test: ['test/**/*.js']
        },

        mochacli: {
            options: {
                require: ['should'],
                reporter: 'spec',
                bail: true
            },

            all: ['test/*_spec.js']
        }
    };

    grunt.initConfig(cfg);

    grunt.registerTask('validate', ['jshint2', 'mochacli']);

    grunt.registerTask('default', ['validate']);
};