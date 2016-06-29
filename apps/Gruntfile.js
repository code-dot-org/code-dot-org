var chalk = require('chalk');
var child_process = require('child_process');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var webpack = require('webpack');
var _ = require('lodash');
var logBuildTimes = require('./script/log-build-times');
var webpackConfig = require('./webpack');
var envConstants = require('./envConstants');

module.exports = function (grunt) {
  // Decorate grunt to record and report build durations.
  var buildTimeLogger = logBuildTimes(grunt);

  process.env.mocha_entry = grunt.option('entry') || '';
  if (process.env.mocha_entry) {
    // create an entry-tests.js file with the right require statement
    // so that karma + webpack can do their thing. For some reason, you
    // can't just point the test runner to the file itself as it won't
    // get compiled.
    fs.writeFileSync(
      'test/entry-tests.js',
      "require('"+path.resolve(process.env.mocha_entry)+"');\n"
    );
  }

  var config = {};

  /**
   * Interval for filesystem polling in watch mode.
   * Warning: 100ms hits 75% CPU on OS X. 700ms is around 10%.
   * See https://github.com/gruntjs/grunt-contrib-watch/issues/145
   * If OS X polling remains a CPU issue, can try grunt-este-watch
   * @const {number}
   */
  var DEV_WATCH_INTERVAL = parseInt(grunt.option('delay')) || 700;

  /** @const {number} */
  var PLAYGROUND_PORT = grunt.option('playground-port') || 8000;

  /** @const {string} */
  var SINGLE_APP = grunt.option('app') || envConstants.APP;

  /** @const {string[]} */
  var ALL_APPS = [
    'maze',
    'turtle',
    'bounce',
    'flappy',
    'studio',
    'jigsaw',
    'calc',
    'applab',
    'eval',
    'netsim',
    'craft',
    'gamelab'
  ];

  if (SINGLE_APP && ALL_APPS.indexOf(SINGLE_APP) === -1) {
    throw new Error('Unknown app: ' + SINGLE_APP);
  }

  var appsToBuild = SINGLE_APP ? [SINGLE_APP] : ALL_APPS;

  var ace_suffix = envConstants.DEV ? '' : '-min';
  var dotMinIfNotDev = envConstants.DEV ? '' : '.min';
  var piskelRoot = String(child_process.execSync('`npm bin`/piskel-root')).replace(/\s+$/g,'');
  var PISKEL_DEVELOPMENT_MODE = grunt.option('piskel-dev');
  if (PISKEL_DEVELOPMENT_MODE) {
    var localNodeModulesRoot = String(child_process.execSync('npm prefix')).replace(/\s+$/g,'');
    if (piskelRoot.indexOf(localNodeModulesRoot) === -1) {
      // Piskel has been linked to a local development repo, we're good to go.
      piskelRoot = path.resolve(piskelRoot, '..', 'dev');
      console.log(chalk.bold.yellow('-- PISKEL DEVELOPMENT MODE --'));
      console.log(chalk.yellow('Make sure you have a local development build of piskel'));
      console.log(chalk.yellow('Inlining PISKEL_DEVELOPMENT_MODE=true'));
      console.log(chalk.yellow('Copying development build of Piskel instead of release build'));

    } else {
      console.log(chalk.bold.red('Unable to enable Piskel development mode.'));
      console.log(chalk.red('In order to use Piskel development mode, your apps ' +
          'package must be linked to a local development copy of the Piskel ' +
          'repository with a complete dev build.' +
          '\n' +
          '\n  1. git clone https://github.com/code-dot-org/piskel.git <new-directory>' +
          '\n  2. cd <new-directory>' +
          '\n  3. npm install && grunt build-dev' +
          '\n  4. npm link' +
          '\n  5. cd -' +
          '\n  6. npm link @code-dot-org/piskel' +
          '\n  7. rerun your previous command' +
          '\n'));
      process.exitCode = 1; // Failure!
      return;
    }
  }

  config.clean = {
    all: ['build']
  };

  config.copy = {
    src: {
      files: [
        {
          expand: true,
          cwd: 'src/',
          src: ['**/*.js', '**/*.jsx'],
          dest: 'build/js'
        }
      ]
    },
    static: {
      files: [
        {
          expand: true,
          cwd: 'static/',
          src: ['**'],
          dest: 'build/package/media'
        },
        {
          expand: true,
          cwd: 'lib/blockly/media',
          src: ['**'],
          //TODO: Would be preferrable to separate Blockly media.
          dest: 'build/package/media'
        },
        {
          expand: true,
          cwd: 'style/applab',
          src: ['*.css'],
          dest: 'build/package/css'
        }
      ]
    },
    lib: {
      files: [
        {
          expand: true,
          cwd: 'lib/blockly',
          src: ['??_??.js'],
          dest: 'build/package/js',
          // e.g., ar_sa.js -> ar_sa/blockly_locale.js
          rename: function (dest, src) {
            var outputPath = src.replace(/(.{2}_.{2})\.js/g, '$1/blockly_locale.js');
            return path.join(dest, outputPath);
          }
        },
        {
          expand: true,
          cwd: 'lib/ace/src' + ace_suffix + '-noconflict/',
          src: ['**/*.js'],
          dest: 'build/package/js/ace/'
        },
        {
          expand: true,
          cwd: 'lib/p5play',
          src: ['*.js'],
          dest: 'build/package/js/p5play/'
        },
        {
          expand: true,
          cwd: piskelRoot,
          src: '**',
          dest: 'build/package/js/piskel/'
        },
        {
          expand: true,
          cwd: 'lib/droplet',
          src: ['droplet-full' + dotMinIfNotDev + '.js'],
          dest: 'build/package/js/droplet/',
          rename: function (src, dest) {
            // dest name should be the same, whether or not minified
            return src + dest.replace(/\.min.js$/, '.js');
          }
        },
        {
          expand: true,
          cwd: 'lib/droplet',
          src: ['droplet.min.css'],
          dest: 'build/package/css/droplet/'
        },
        {
          expand: true,
          cwd: 'lib/tooltipster',
          src: ['jquery.tooltipster' + dotMinIfNotDev + '.js'],
          dest: 'build/package/js/tooltipster/',
          rename: function (src, dest) {
            // dest name should be the same, whether or not minified
            return src + dest.replace(/\.min.js$/, '.js');
          }
        },
        {
          expand: true,
          cwd: 'lib/marked',
          src: ['marked' + dotMinIfNotDev + '.js'],
          dest: 'build/package/js/marked/',
          rename: function (src, dest) {
            // dest name should be the same, whether or not minified
            return src + dest.replace(/\.min.js$/, '.js');
          }
        },
        {
          expand: true,
          cwd: 'lib/phaser',
          src: ['phaser' + dotMinIfNotDev + '.js'],
          dest: 'build/package/js/phaser/',
          rename: function (src, dest) {
            // dest name should be the same, whether or not minified
            return src + dest.replace(/\.min.js$/, '.js');
          }
        },
        {
          expand: true,
          cwd: 'lib/tooltipster',
          src: ['tooltipster.min.css'],
          dest: 'build/package/css/tooltipster/'
        },
        {
          expand: true,
          cwd: 'lib/fileupload',
          src: [
            'jquery.fileupload' + dotMinIfNotDev + '.js',
            'jquery.iframe-transport' + dotMinIfNotDev + '.js'
          ],
          dest: 'build/package/js/fileupload/',
          rename: function (src, dest) {
            // dest name should be the same, whether or not minified
            return src + dest.replace(/\.min.js$/, '.js');
          }
        },
        {
          expand: true,
          cwd: 'lib/jsinterpreter',
          src: ['*.js'],
          dest: 'build/package/js/jsinterpreter/'
        }
      ]
    }
  };

  config.sass = {
    all: {
      options: {
        // Compression currently occurs at the ../dashboard sprockets layer.
        outputStyle: 'nested',
        includePaths: ['../shared/css/']
      },
      files: _.zipObject([
        ['build/package/css/common.css', 'style/common.scss'],
        ['build/package/css/readonly.css', 'style/readonly.scss']
      ].concat(appsToBuild.map(function (app) {
        return [
          'build/package/css/' + app + '.css', // dst
          'style/' + app + '/style.scss' // src
        ];
      })))
    }
  };

  // Takes a key-value .json file and runs it through MessageFormat to create a localized .js file.
  config.messages = {
    all: {
      files: [
        {
          // e.g., build/js/i18n/bounce/ar_sa.json -> build/package/js/ar_sa/bounce_locale.js
          rename: function (dest, src) {
            var outputPath = src.replace(/(build\/)?i18n\/(\w*)\/(\w+_\w+).json/g, '$3/$2_locale.js');
            return path.join(dest, outputPath);
          },
          expand: true,
          src: ['i18n/**/*.json'],
          dest: 'build/package/js/'
        }
      ]
    }
  };

  config.ejs = {
    all: {
      srcBase: 'src',
      destBase: 'build/js'
    }
  };

  var OUTPUT_DIR = 'build/package/js/';
  config.exec = {
    convertScssVars: './script/convert-scss-variables.js',
  };

  config.karma = {
    options: {
      configFile: 'karma.conf.js',
      singleRun: !envConstants.WATCH,
      files: [
        {pattern: 'test/audio/**/*', watched: false, included: false, nocache: true},
        {pattern: 'test/integration/**/*', watched: false, included: false, nocache: true},
        {pattern: 'test/unit/**/*', watched: false, included: false, nocache: true},
        {pattern: 'test/util/**/*', watched: false, included: false, nocache: true},
        {pattern: 'lib/**/*', watched: false, included: false, nocache: true},
        {pattern: 'build/**/*', watched: false, included: false, nocache: true},
        {pattern: 'static/**/*', watched: false, included: false, nocache: true},
      ],
      client: {
        mocha: {
          timeout: 14000,
          grep: grunt.option('grep'),
        },
      },
    },
    unit: {
      files: [
        {src: ['test/unit-tests.js'], watched: false},
      ],
    },
    integration: {
      files: [
        {src: ['test/integration-tests.js'], watched: false},
      ],
    },
    all: {
      files: [
        {src: ['test/index.js'], watched: false},
      ],
    },
    entry: {
      files: [
        {src: ['test/entry-tests.js'], watched: false},
      ],
      preprocessors: {
        'test/entry-tests.js': ['webpack', 'sourcemap'],
      },
    },
  };

  var codeStudioEntries = {
    // codeStudio: './src/code-studio/code-studio.js',
    // levelbuilder: './src/code-studio/levelbuilder.js',
    // levelbuilderMarkdown: './src/code-studio/levelbuilder_markdown.js',
    // levelbuilderStudio: './src/code-studio/levelbuilder_studio.js',
    // districtDropdown: './src/code-studio/districtDropdown.js',
    // contractMatch: './src/code-studio/levels/contract_match.jsx',
    // widget: './src/code-studio/levels/widget.js',
    // external: './src/code-studio/levels/external.js',
    // // gets required by levelGroup
    // // multi: './src/code-studio/levels/multi.js',
    // // textMatch: './src/code-studio/levels/textMatch.js',
    // levelGroup: './src/code-studio/levels/levelGroup.js',
    // dialogHelper: './src/code-studio/levels/dialogHelper.js',
    // initApp: './src/code-studio/initApp/initApp.js'
  };

  var bundles = [
    {
      entries: _.zipObject(appsToBuild.map(function (app) {
        return [app, './src/' + app + '/main.js'];
      }).concat(appsToBuild.indexOf('applab') === -1 ? [] :
        [['applab-api', './src/applab/api-entry.js']]
      )),
      commonFile: 'common'
    },

    // embedBlocks.js is just React, the babel-polyfill, and a few other dependencies
    // in a bundle to minimize the amound of stuff we need when loading blocks
    // in an iframe.
    {
      entries: {
        embedBlocks: './src/code-studio/embedBlocks.js'
      },
      provides: ['react', 'react-dom', 'radium']
    },

    {
      entries: {
        makerlab: './src/code-studio/makerlab/makerlabDependencies.js'
      },
      provides: ['johnny-five', 'playground-io', 'chrome-serialport']
    },

    {
      entries: {
        pd: './src/code-studio/pd/workshop_dashboard/workshop_dashboard.jsx'
      }
    }
  ];

  // Create a config for each of our bundles
  function createConfigs(bundles, options) {
    var minify = options.minify;
    var watch = options.watch;

    return bundles.map(function (bundle) {
      var entries = bundle.entries;
      var commonFile = bundle.commonFile;
      var provides = bundle.provides;

      return webpackConfig.create({
        output: path.resolve(__dirname, OUTPUT_DIR),
        entries: entries,
        commonFile: commonFile,
        provides: provides,
        minify: minify,
        watch: watch,
        piskelDevMode: PISKEL_DEVELOPMENT_MODE
      });
    });
  }

  config.webpack = {
    build: createConfigs(bundles, {
      minify: false,
      watch: false,
    }),

    uglify: createConfigs(bundles, {
      minify: true,
      watch: false
    }),

    watch: createConfigs(bundles, {
      minify: false,
      watch: true
    })
  };

  var ext = envConstants.DEV ? 'uncompressed' : 'compressed';
  config.concat = {
    vendor: {
      nonull: true,
      src: [
        'lib/blockly/preamble_' + ext + '.js',
        'lib/blockly/blockly_' + ext + '.js',
        'lib/blockly/blocks_' + ext + '.js',
        'lib/blockly/javascript_' + ext + '.js',
      ],
      dest: 'build/package/js/blockly.js'
    }
  };

  config.express = {
    playground: {
      options: {
        port: PLAYGROUND_PORT,
        bases: path.resolve(__dirname, 'build/package'),
        server: path.resolve(__dirname, './src/dev/server.js')
      }
    }
  };


  config.uglify = {
    lib: {
      files: _.zipObject([
        'jsinterpreter/interpreter.js',
        'jsinterpreter/acorn.js',
        'p5play/p5.play.js',
        'p5play/p5.js'
      ].map(function (src) {
        return [
          OUTPUT_DIR + src.replace(/\.js$/, '.min.js'), // dst
          OUTPUT_DIR + src // src
        ];
      }))
    }
  };

  config.watch = {
    // JS files watched by webpack
    style: {
      files: ['style/**/*.scss', 'style/**/*.sass'],
      tasks: ['newer:sass', 'notify:sass'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        livereload: envConstants.AUTO_RELOAD,
        interrupt: true
      }
    },
    content: {
      files: ['static/**/*'],
      tasks: ['newer:copy', 'notify:content'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        livereload: envConstants.AUTO_RELOAD
      }
    },
    vendor_js: {
      files: ['lib/**/*.js'],
      tasks: ['newer:concat', 'newer:copy:lib', 'notify:vendor_js'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        livereload: envConstants.AUTO_RELOAD
      }
    },
    messages: {
      files: ['i18n/**/*.json'],
      tasks: ['messages', 'notify:messages'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        livereload: envConstants.AUTO_RELOAD
      }
    },
  };

  config.concurrent = {
    // run our two watch tasks concurrently so that they dont block each other
    watch: {
      tasks: ['watch', 'webpack:watch'],
      options: {
        logConcurrentOutput: true
      }
    }
  },

  config.strip_code = {
    options: {
      start_comment: 'start-test-block',
      end_comment: 'end-test-block'
    },
    all: {
      src: ['build/js/*.js']
    }
  };

  config.notify = {
    'js-build': {options: {message: 'JS build completed.'}},
    sass: {options: {message: 'SASS build completed.'}},
    content: {options: {message: 'Content build completed.'}},
    ejs: {options: {message: 'EJS build completed.'}},
    messages: {options: {message: 'i18n messages build completed.'}},
    vendor_js: { options: {message: 'Blockly concat & vendor JS copy done.'}}
  };

  grunt.initConfig(config);

  // Autoload grunt tasks
  require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '!grunt-lib-contrib']});

  grunt.loadTasks('tasks');
  grunt.registerTask('noop', function () {
  });

  // Generate locale stub files in the build/locale/current folder
  grunt.registerTask('locales', function () {
    var current = path.resolve('build/locale/current');
    mkdirp.sync(current);
    appsToBuild.concat('common').map(function (item) {
      var localeType = (item === 'common' ? 'locale' : 'appLocale');
      var localeString = '/*' + item + '*/ ' +
        'module.exports = window.blockly.' + localeType + ';';
      fs.writeFileSync(path.join(current, item + '.js'), localeString);
    });
  });

  // Checks the size of Droplet to ensure it's built with LANGUAGE=javascript
  grunt.registerTask('checkDropletSize', function () {
    var bytes = fs.statSync('lib/droplet/droplet-full.min.js').size;
    if (bytes > 500 * 1000) {
      grunt.warn('"droplet-full.min.js" is larger than 500kb. Did you build with LANGUAGE=javascript?');
    }
  });

  grunt.registerTask('prebuild', [
    'checkDropletSize',
    'newer:messages',
    'exec:convertScssVars',
    'newer:copy:src',
    'newer:copy:lib',
    'locales',
    'newer:strip_code',
    'ejs'
  ]);

  grunt.registerTask('compile-firebase-rules', function () {
    try {
      child_process.execSync('ls `npm bin`/firebase-bolt');
    } catch (e) {
      console.log(chalk.yellow("'firebase-bolt' not found. running 'npm install'..."));
      try {
        child_process.execSync('which npm');
      } catch (e) {
        throw new Error("'firebase-bolt' not found and 'npm' not installed.");
      }
      child_process.execSync('npm install');
    }
    child_process.execSync('mkdir -p ./build/package/firebase');
    child_process.execSync('`npm bin`/firebase-bolt < ./firebase/rules.bolt > ./build/package/firebase/rules.json');
  });

  grunt.registerTask('postbuild', [
    'newer:copy:static',
    'newer:concat',
    'newer:sass',
    'compile-firebase-rules'
  ]);

  grunt.registerTask('build', [
    'prebuild',
    'webpack:build'
  ].concat([
    'notify:js-build',
    // Skip minification in development environment.
    envConstants.DEV ? 'noop' : 'webpack:uglify',
    // Skip minification in development environment.
    envConstants.DEV ? 'noop' : 'uglify:lib',
    'postbuild'
  ]));

  grunt.registerTask('rebuild', ['clean', 'build']);

  grunt.registerTask('dev', [
    'prebuild',
    'concurrent:watch',
    'postbuild',
  ]);

  grunt.registerTask('unitTest', [
    'newer:messages',
    'exec:convertScssVars',
    'concat',
    'karma:unit'
  ]);

  grunt.registerTask('integrationTest', [
    'newer:messages',
    'exec:convertScssVars',
    'newer:copy:static',
    'concat',
    'karma:integration'
  ]);

  grunt.registerTask('test', [
    'newer:messages',
    'exec:convertScssVars',
    'newer:copy:static',
    'concat',
    'karma:all'
  ]);

  // We used to use 'mochaTest' as our test command.  Alias to be friendly while
  // we transition away from it.  This can probably be removed in a month or two.
  // - Brad (16 May 2016)
  grunt.registerTask('showMochaTestWarning', function () {
    console.log(chalk.yellow('Warning: ') + 'The ' + chalk.italic('mochaTest') +
        ' task is deprecated.  Use ' + chalk.italic('test') + ' instead, or' +
        ' directly invoke its subtasks ' + chalk.italic('unitTest') + ' and ' +
        chalk.italic('integrationTest') + '.');
  });
  grunt.registerTask('mochaTest', ['showMochaTestWarning', 'test']);

  grunt.registerTask('logBuildTimes', function () {
    var done = this.async();
    buildTimeLogger.upload(console.log, done);
  });

  grunt.registerTask('default', ['rebuild', 'test']);
};
