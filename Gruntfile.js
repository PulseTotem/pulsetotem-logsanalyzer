module.exports = function (grunt) {
    'use strict';

    // load extern tasks
    grunt.loadNpmTasks('grunt-update-json');
    grunt.loadNpmTasks('grunt-npm-install');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-symlink');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-env');


	// tasks
    grunt.initConfig({

        coreReposConfig : grunt.file.readJSON('core-repos-config.json'),

// ---------------------------------------------
//                               configure tasks
// ---------------------------------------------
        env : {
            test : {
                NODE_ENV : 'test'
            },
            build : {
                NODE_ENV : 'production'
            }
        },

        symlink: {
            coreBackend: {
                src: '<%= coreReposConfig.coreBackendRepoPath %>',
                dest: 't6s-core/core-backend'
            }
        },

        update_json: {
            packageBuild: {
                src: ['t6s-core/core-backend/package.json', 'package.json'],
                dest: 'package-tmp.json',
                fields: [
                    'name',
                    'version',
                    'dependencies',
                    'devDependencies',
                    'overrides'
                ]
            }
        },
// ---------------------------------------------

// ---------------------------------------------
//                          build and dist tasks
// ---------------------------------------------
        copy: {
            buildConnectionInfosFile: {
                files: 	[{'build/js/connection_infos.json': 'scripts/database/connection_infos.json'}]
            },
            buildPackageBak: {
                files: 	[{'package-bak.json': 'package.json'}]
            },
            buildPackageReplace: {
                files: 	[{'package.json': 'package-tmp.json'}]
            },
            buildPackageReinit: {
                files: 	[{'package.json': 'package-bak.json'}]
            },
            keepPackage: {
                files: 	[{'build/package.json': 'package.json'}]
            },
            distPackage: {
              files: 	[{'dist/package.json': 'package.json'}]
            }
        },

        typescript: {
            build: {
                src: [
                    'scripts/LogsAnalyzer.ts'
                ],
                dest: 'build/js/LogsAnalyzer.js',
                options: {
                    module: 'commonjs',
                    basePath: 'scripts'
                }
            },
            test: {
                src: [
                    'tests/**/*.ts'
                ],
                dest: 'build/tests/Test.js'
            }
        },

        express: {
            options: {
                port: 11000
            },
            build: {
                options: {
                    script: 'build/js/LogsAnalyzer.js',
                    args: ["loglevel=debug"]
                }
            }
        },
// ---------------------------------------------





// ---------------------------------------------
//                                 develop tasks
// ---------------------------------------------
        watch: {
            express: {
                files:  [ 'build/js/LogsAnalyzer.js' ],
                tasks:  [ 'express:build' ],
                options: {
                    spawn: false
                }
            },

            developServer: {
                files: ['scripts/**/*.ts', 't6s-core/core-backend/scripts/**/*.ts'],
                tasks: ['typescript:build']
            }
        },
// ---------------------------------------------

// ---------------------------------------------
//                                 doc tasks
// ---------------------------------------------
        yuidoc: {
            compile: {
                name: 'PulseTotem LogsAnalyzer',
                description: 'LogsAnalyzer for PulseTotem',
                version: '0.0.1',
                url: 'http://www.pulsetotem.fr',
                options: {
                    extension: '.ts, .js',
                    paths: ['scripts/'],
                    outdir: 'doc/'
                }
            }
        },
// ---------------------------------------------

// ---------------------------------------------
//                                 test tasks
// ---------------------------------------------
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    colors: true,
                    captureFile: 'build/tests/result.txt'
                },
                src: ['build/tests/Test.js']
            },
            jenkins: {
                options: {
                    reporter: 'mocha-jenkins-reporter',
                    quiet: false,
                    reporterOptions: {
                        "junit_report_name": "Tests",
                        "junit_report_path": "build/tests/report.xml",
                        "junit_report_stack": 1
                    }
                },
                src: ['build/tests/Test.js']
            }
        },

        mocha_istanbul: {
            coverage: {
                src: 'build/tests/', // a folder works nicely
                options: {
                    mask: '*.js',
                    root: 'build/tests/',
                    reportFormats: ['cobertura', 'html'],
                    coverageFolder: 'build/coverage'
                }
            },
        },
// ---------------------------------------------

// ---------------------------------------------
//                                    clean task
// ---------------------------------------------
        clean: {
            package: ['package-bak.json', 'package-tmp.json'],
            build: ['build/'],
            dist: ['dist/'],
            doc: ['doc'],
            test: ['build/tests/Test.js']
        }
// ---------------------------------------------
    });

    // register tasks
    grunt.registerTask('default', ['build']);

    grunt.registerTask('init', ['symlink:coreBackend']);

    grunt.registerTask('initJenkins', ['init','symlink:core']);

    grunt.registerTask('build', function () {
        grunt.task.run(['clean:package', 'clean:build']);

        grunt.task.run(['env:build','update_json:packageBuild', 'copy:buildPackageBak', 'copy:buildPackageReplace', 'npm-install', 'copy:keepPackage', 'copy:buildPackageReinit', 'copy:buildConnectionInfosFile', 'typescript:build', 'clean:package']);
    });

    grunt.registerTask('develop', ['build', 'express:build', 'watch']);

    grunt.registerTask('doc', ['clean:doc', 'yuidoc']);

	grunt.registerTask('coverage', ['test', 'mochaTest:coverage']);
    grunt.registerTask('initTest', function() {
        grunt.task.run(['clean:build']);

        grunt.task.run(['env:test','update_json:packageBuild', 'copy:buildPackageBak', 'copy:buildPackageReplace', 'npm-install', 'copy:buildPackageReinit','copy:testConnectionInfosFile', 'typescript:build', 'typescript:test']);
    });


    grunt.registerTask('coverage', ['initTest', 'mocha_istanbul:coverage']);
    grunt.registerTask('test', ['initTest', 'mochaTest:test']);

    grunt.registerTask('jenkins', ['initTest', 'mochaTest:jenkins', 'mocha_istanbul:coverage', 'clean:package']);

}