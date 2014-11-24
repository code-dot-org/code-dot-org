module.exports = function (grunt) {

  var _ = require('lodash');
  var path = require('path');

  var config = {};

  var APPS = process.env.MOOC_APP ? [process.env.MOOC_APP] : [
    'maze',
    'turtle',
    'bounce',
    'flappy',
    'studio',
    'jigsaw',
    'calc',
    'webapp',
    'eval'
  ];

// Parse options from environment.
  var MINIFY = (process.env.MOOC_MINIFY === '1');
  var DEV = (process.env.MOOC_DEV === '1');

  var LOCALES = [
    'ar_sa',
    'az_az',
    'bg_bg',
    'bn_bd',
    'ca_es',
    'cs_cz',
    'da_dk',
    'de_de',
    'el_gr',
    'en_us',
    'en_ploc',
    'es_es',
    'eu_es',
    'fa_ir',
    'fi_fi',
    'fil_ph',
    'fr_fr',
    'he_il',
    'hi_in',
    'hr_hr',
    'hu_hu',
    'id_id',
    'is_is',
    'it_it',
    'ja_jp',
    'ko_kr',
    'lt_lt',
    'ms_my',
    'nl_nl',
    'no_no',
    'pl_pl',
    'pt_br',
    'pt_pt',
    'ro_ro',
    'ru_ru',
    'sk_sk',
    'sl_si',
    'sq_al',
    'sr_sp',
    'sv_se',
    'ta_in',
    'th_th',
    'tr_tr',
    'uk_ua',
    'ur_pk',
    'vi_vn',
    'zh_cn',
    'zh_tw'
  ];

  config.clean = {
    all: ['build']
  };

  var ace_suffix = DEV ? '' : '-min';
  var droplet_suffix = DEV ? '' : '.min';
  var requirejs_dir = DEV ? 'full' : 'min';

  config.copy = {
    src: {
      files: [
        {
          expand: true,
          cwd: 'src/',
          src: ['**/*.js'],
          dest: 'build/js'
        }
      ]
    },
    locale: {
      files: [
        {
          expand: true,
          cwd: 'locale/',
          src: ['**/*.js'],
          dest: 'build/locale'
        }
      ]
    },
    browserified: {
      files: [
        {
          expand: true,
          cwd: 'build/browserified',
          src: ['**/*.js'],
          dest: 'build/package/js'
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
        }
      ]
    },
    lib: {
      files: [
        {
          expand: true,
          cwd: 'lib/ace/src' + ace_suffix + '-noconflict/',
          src: ['**/*.js'],
          dest: 'build/package/js/ace/'
        },
        {
          expand: true,
          cwd: 'lib/requirejs/' + requirejs_dir + '/',
          src: ['require.js'],
          dest: 'build/package/js/requirejs/'
        },
        {
          expand: true,
          cwd: 'lib/droplet',
          src: ['droplet-full' + droplet_suffix + '.js'],
          dest: 'build/package/js/droplet/'
        },
        {
          expand: true,
          cwd: 'lib/droplet',
          src: ['droplet.min.css'],
          dest: 'build/package/css/droplet/'
        },
        {
          expand: true,
          cwd: 'lib/jsinterpreter',
          src: ['acorn_interpreter.js'],
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
          'create', 'flatten', 'isEmpty', 'wrap']
      }
    }
  };

  config.sass = {
    all: {
      options: {
        outputStyle: (MINIFY ? 'compressed' : 'nested')
      },
      files: {
        'build/package/css/common.css': 'style/common.scss'
      }
    }
  };
  APPS.filter(function (app) {
    return app != 'none';
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
          rename: function(dest, src) {
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

  config.browserify = {};
  var allFilesSrc = [];
  var allFilesDest = [];
  var outputDir = 'build/package/js/';
  APPS.forEach(function (app) {
    allFilesSrc.push('build/js/' + app + '/main.js');
    allFilesDest.push(outputDir+app+'.js');
  });

  // Use command-line tools to run browserify (faster/more stable this way)
  var browserifyExec = 'mkdir -p build/browserified && `npm bin`/browserify ' + allFilesSrc.join(' ') +
    ' -p [ factor-bundle -o ' + allFilesDest.join(' -o ') + ' ] -o ' + outputDir + 'common.js';

  config.exec = {
    browserify: browserifyExec,
    watchify: browserifyExec.replace('browserify', 'watchify') + ' -v'
  };

  var vendorFiles = {};
  LOCALES.forEach(function (locale) {
    var ext = DEV ? 'uncompressed' : 'compressed';
    var files = {};
    var dest = outputDir + locale + '/vendor.js';
    files[dest] = [
        'lib/blockly/blockly_' + ext + '.js',
        'lib/blockly/blocks_' + ext + '.js',
        'lib/blockly/javascript_' + ext + '.js',
        'lib/blockly/' + locale + '.js',
        'lib/messageformat/messageformat' + (DEV ? '' : '.min') + '.js'
    ];
    vendorFiles = _.merge(vendorFiles,files);
  });

  config.concat = {
    vendor: {
      nonull: true,
      files: vendorFiles
    }
  };

  config.express = {
    server: {
      options: {
        port: 8000,
        bases: path.resolve(__dirname, 'build/package'),
        server: path.resolve(__dirname, './src/dev/server.js'),
        livereload: true
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
    config.uglify[app] = {files: appUglifiedFiles };
  });

// Run uglify task across all apps in parallel
  config.concurrent = {
    uglify: _.map(['common'].concat(APPS), function (x) {
      return 'uglify:' + x
    })
  };

  config.watch = {
    locale: {
      files: ['locale/**/*.js'],
      tasks: ['newer:copy:locale']
    },
    js: {
      files: ['src/**/*.js'],
      tasks: ['newer:copy:src']
    },
    style: {
      files: ['style/**/*.scss', 'style/**/*.sass'],
      tasks: ['newer:sass']
    },
    content: {
      files: ['static/**/*'],
      tasks: ['newer:copy']
    },
    vendor_js: {
      files: ['lib/**/*.js'],
      tasks: ['newer:concat', 'newer:copy:lib']
    },
    ejs: {
      files: ['src/**/*.ejs'],
      tasks: ['ejs']
    },
    messages: {
      files: ['i18n/**/*.json'],
      tasks: ['pseudoloc', 'messages', 'exec:browserify', 'newer:copy:browserified']
    },
    dist: {
      files: ['build/package/**/*'],
      options: {
        livereload: true
      }
    }
  };

  config.jshint = {
    options: {
      node: true,
      browser: true,
      globals: {
        Blockly: true,
        //TODO: Eliminate the globals below here.
        BlocklyApps: true,
        Maze: true,
        Turtle: true,
        Bounce: true
      }
    },
    all: [
      'Gruntfile.js',
      'tasks/**/*.js',
      'src/**/*.js',
      'test/**/*.js',
      '!src/hammer.js',
      '!src/lodash.js',
      '!src/lodash.min.js',
      '!src/canvg/*.js'
    ]
  };

  config.mochaTest = {
    all: {
      options: {
        reporter: 'spec',
        timeout: 10000
      },
      src: ['test/*.js']
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

  // Autoload grunt tasks
  require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '!grunt-lib-contrib']});

  grunt.initConfig(config);
  grunt.loadTasks('tasks');
  grunt.registerTask('noop', function () {});

  // grunt-contrib-symlink doesn't support overwrite option, so we need to create the symlink manually
  grunt.registerTask('dashboard_link', function () {
    var fs = require('fs');
    fs.unlinkSync('../dashboard/public/blockly');
    fs.symlinkSync('../../blockly/build/package', '../dashboard/public/blockly', 'dir');
  });

  grunt.registerTask('prebuild', [
    'pseudoloc',
    'newer:messages',
    DEV ? 'dashboard_link' : 'noop',
    'newer:copy:src',
    'newer:copy:locale',
    'newer:strip_code',
    'ejs'
  ]);

  grunt.registerTask('postbuild', [
    'newer:copy:browserified',
    'newer:copy:static',
    'newer:copy:lib',
    'newer:concat',
    'newer:sass'
  ]);

  grunt.registerTask('build', [
    'prebuild',
    'exec:browserify',
    // Skip minification in development environment.
    DEV ? 'noop' : ('concurrent:uglify'),
    'postbuild'
  ]);

  grunt.registerTask('rebuild', ['clean', 'build']);

  config.concurrent['watch'] = {
    tasks: ['exec:watchify', 'watch'],
    options: {
      logConcurrentOutput: true
    }
  };

  grunt.registerTask('dev', [
    'prebuild',
    'postbuild',
    'express:server',
    'concurrent:watch'
  ]);
  grunt.registerTask('test', ['jshint', 'mochaTest']);
  grunt.registerTask('default', ['rebuild', 'test']);

  config.mochaTest.all.options.grep = new RegExp(grunt.option('grep'));
};
