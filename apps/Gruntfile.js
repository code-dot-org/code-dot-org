var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var glob = require('glob');
var readline = require('readline');
var logBuildTimes = require('./script/log-build-times');

module.exports = function (grunt) {
  // Decorate grunt to record and report build durations.
  logBuildTimes(grunt);

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
  var APP_TO_BUILD = grunt.option('app') || process.env.MOOC_APP;

  /** @const {string[]} */
  var APPS = [
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

  if (APP_TO_BUILD) {
    if (APPS.indexOf(APP_TO_BUILD) === -1) {
      throw new Error('Unknown app: ' + APP_TO_BUILD);
    }
    APPS = [APP_TO_BUILD];
  }

  // Parse options from environment.
  var envOptions = {
    dev: (process.env.MOOC_DEV === '1')
  };

  config.clean = {
    all: ['build']
  };

  var ace_suffix = envOptions.dev ? '' : '-min';
  var dotMinIfNotDev = envOptions.dev ? '' : '.min';

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
          cwd: 'lib/piskel',
          src: ['**/*'],
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

  config.lodash = {
    'build': {
      'dest': 'src/lodash.js',
      'options': {
        'include': [
          'debounce', 'reject', 'map', 'value', 'range', 'without', 'sample',
          'create', 'flatten', 'isEmpty', 'wrap', 'size', 'bind', 'contains',
          'last', 'clone', 'cloneDeep', 'isEqual', 'find', 'sortBy', 'throttle',
          'uniq', 'assign', 'merge'
        ]
      }
    }
  };

  config.sass = {
    all: {
      options: {
        // Compression currently occurs at the ../dashboard sprockets layer.
        outputStyle: 'nested',
        includePaths: ['../shared/css/']
      },
      files: {
        'build/package/css/common.css': 'style/common.scss',
        'build/package/css/readonly.css': 'style/readonly.scss'
      }
    }
  };
  APPS.filter(function (app) {
    return app !== 'none';
  }).forEach(function (app) {
    var src = 'style/' + app + '/style.scss';
    var dest = 'build/package/css/' + app + '.css';
    config.sass.all.files[dest] = src;
  });

  config.pseudoloc = {
    all: {
      srcBase: 'i18n',
      srcLocale: 'en_us',
      destBase: 'build/i18n',
      pseudoLocale: 'en_ploc'
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
          src: ['i18n/**/*.json', 'build/i18n/**/*.json'],
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

  var allFilesSrc = [];
  var allFilesDest = [];
  var outputDir = 'build/package/js/';
  APPS.forEach(function (app) {
    allFilesSrc.push('build/js/' + app + '/main.js');
    allFilesDest.push(outputDir + app + '.js');
  });

  /**
   * Generates a command line string to execute browserify with the specified options.
   * Available options are:
   *
   * @param {!Object} options
   * @param {boolean} [options.globalShim] - boolean for whether or not to turn on
   *        the browserify-global-shim transform
   * @param {!string} options.cacheFile - file name where the browserify cache should be stored
   * @param {!string[]} options.srcFiles - list of src files to pass to browserify
   * @param {!string[]} options.destFiles - list of destination file paths to pass to browserify
   * @param {boolean} [options.factorBundle] - whether or not to use the factor-bundle plugin to
   *        extract common code into a separate file.
   */
  function getBrowserifyCommand(options) {
    // Use command-line tools to run browserify (faster/more stable this way)
    var cmd = 'mkdir -p build/browserified &&' +
          (envOptions.dev ? '' : ' NODE_ENV=production') + // Necessary for production Redux
          ' `npm bin`/browserifyinc';
    if (options.globalShim) {
      cmd += ' -g [ browserify-global-shim ]';
    }
    if (options.cacheFile) {
      cmd += ' --cachefile ' + outputDir + options.cacheFile;
    }
    cmd += ' --extension=.jsx' +
      ' -t [ babelify --compact=false --sourceMap ]' +
      (envOptions.dev ? '' : ' -t loose-envify') +
      ' -d ' + options.srcFiles.join(' ');
    if (options.factorBundle) {
      cmd += ' -p [ factor-bundle -o ' +
        options.destFiles.join(' -o ') +
        ' ] -o ' + outputDir + 'common.js';
    } else {
      cmd += ' -o ' + options.destFiles[0];
    }
    return cmd;
  }

  var browserifyExec = getBrowserifyCommand({
    globalShim: true,
    cacheFile: 'browserifyinc.cache.json',
    srcFiles: allFilesSrc,
    destFiles: allFilesDest,
    factorBundle: APPS.length > 1,
  });

  var applabAPIExec = getBrowserifyCommand({
    globalShim: false,
    cacheFile: 'applab-api.cache.json',
    srcFiles: ['build/js/applab/api-entry.js'],
    destFiles: [outputDir + 'applab-api.js'],
    factorBundle: false,
  });

  var fastMochaTest = process.argv.indexOf('--fast') !== -1;

  config.exec = {
    browserify: 'echo "' + browserifyExec + '" && ' + browserifyExec,
    convertScssVars: './script/convert-scss-variables.js',
    integrationTest: 'node test/runIntegrationTests.js --color' + (fastMochaTest ? ' --fast' : ''),
    unitTest: 'node test/runUnitTests.js --color',
    applabapi: 'echo "' + applabAPIExec + '" && ' + applabAPIExec,
  };

  var ext = envOptions.dev ? 'uncompressed' : 'compressed';
  config.concat = {
    vendor: {
      nonull: true,
      src: [
        'lib/blockly/blockly_' + ext + '.js',
        'lib/blockly/blocks_' + ext + '.js',
        'lib/blockly/javascript_' + ext + '.js'
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

  var uglifiedFiles = {};
  config.uglify = {
    browserified: {
      files: uglifiedFiles
    }
  };

  ['common'].concat(APPS).forEach(function (app) {
    var src = outputDir + app + '.js';
    var dest = outputDir + app + '.min.js';
    uglifiedFiles[dest] = [src];
    var appUglifiedFiles = {};
    appUglifiedFiles[dest] = [src];
    config.uglify[app] = {files: appUglifiedFiles};
  });

  config.uglify.lib = {files: {}};
  config.uglify.lib.files[outputDir + 'jsinterpreter/interpreter.min.js'] =
      outputDir + 'jsinterpreter/interpreter.js';
  config.uglify.lib.files[outputDir + 'jsinterpreter/acorn.min.js'] =
      outputDir + 'jsinterpreter/acorn.js';
  config.uglify.lib.files[outputDir + 'p5play/p5.play.min.js'] =
      outputDir + 'p5play/p5.play.js';
  config.uglify.lib.files[outputDir + 'p5play/p5.min.js'] =
      outputDir + 'p5play/p5.js';

  // Run uglify task across all apps in parallel
  config.concurrent = {
    uglify: APPS.concat('common', 'lib').map(function (x) {
      return 'uglify:' + x;
    })
  };

  config.watch = {
    js: {
      files: ['src/**/*.{js,jsx}'],
      tasks: ['newer:copy:src', 'exec:browserify', 'exec:applabapi', 'notify:browserify'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        livereload: true,
        interrupt: true
      }
    },
    style: {
      files: ['style/**/*.scss', 'style/**/*.sass'],
      tasks: ['newer:sass', 'notify:sass'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        livereload: true,
        interrupt: true
      }
    },
    content: {
      files: ['static/**/*'],
      tasks: ['newer:copy', 'notify:content'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        livereload: true
      }
    },
    vendor_js: {
      files: ['lib/**/*.js'],
      tasks: ['newer:concat', 'newer:copy:lib', 'notify:vendor_js'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        livereload: true
      }
    },
    ejs: {
      files: ['src/**/*.ejs'],
      tasks: ['ejs', 'exec:browserify', 'notify:ejs'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        livereload: true
      }
    },
    messages: {
      files: ['i18n/**/*.json'],
      tasks: ['pseudoloc', 'messages', 'notify:messages'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        livereload: true
      }
    },
  };

  config.open = {
    playground: {
      path: 'http://localhost:' + PLAYGROUND_PORT
    }
  };

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
    browserify: {options: {message: 'Browserify build completed.'}},
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
    APPS.concat('common').map(function (item) {
      var localeString = '/*' + item + '*/ module.exports = window.blockly.' + (item === 'common' ? 'locale' : 'appLocale') + ';';
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
    'pseudoloc',
    'newer:messages',
    'exec:convertScssVars',
    'newer:copy:src',
    'newer:copy:lib',
    'locales',
    'newer:strip_code',
    'ejs'
  ]);

  grunt.registerTask('postbuild', [
    'newer:copy:static',
    'newer:concat',
    'newer:sass'
  ]);

  grunt.registerTask('build', [
    'prebuild',
    'exec:browserify',
    'exec:applabapi',
    'notify:browserify',
    // Skip minification in development environment.
    envOptions.dev ? 'noop' : ('concurrent:uglify'),
    'postbuild'
  ]);

  grunt.registerTask('rebuild', ['clean', 'build']);

  grunt.registerTask('dev', [
    'build',
    'express:playground',
    'open:playground',
    'watch'
  ]);

  grunt.registerTask('unitTest', [
    'newer:messages',
    'exec:convertScssVars',
    'concat',
    'exec:unitTest'
  ]);

  grunt.registerTask('integrationTest', [
    'newer:messages',
    'exec:convertScssVars',
    'newer:copy:static',
    'concat',
    'exec:integrationTest'
  ]);

  grunt.registerTask('test', ['unitTest', 'integrationTest']);

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

  grunt.registerTask('default', ['rebuild', 'test']);

  process.env.mocha_grep = grunt.option('grep') || '';
  process.env.mocha_debug = grunt.option('debug') || '';
  process.env.mocha_entry = grunt.option('entry') || '';
  process.env.mocha_invert = grunt.option('invert') || '';
};
