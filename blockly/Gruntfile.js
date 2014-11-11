var path = require('path');
var localify = require('./src/dev/localify');

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
var LOCALIZE = (process.env.MOOC_LOCALIZE === '1');
var DEV = (process.env.MOOC_DEV === '1');

var LOCALES = (LOCALIZE ? [
  'af_za',
  'ar_sa',
  'az_az',
  'bg_bg',
  'bn_bd',
  'ca_es',
  'cs_cz',
  'cy_gb',
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
] : [
  'en_us',
//  'en_ploc'
]);

// if specified will, will build en_us, en_ploc, and specified locale
if (process.env.MOOC_LOCALE) {
  LOCALES.push(process.env.MOOC_LOCALE);
}

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
APPS.filter(function (app) { return app != 'none'; }).forEach(function(app) {
  var src = 'style/' + app + '/style.scss';
  var dest = 'build/package/css/' + app + '.css';
  config.sass.all.files[dest] = src;
});

// 'Pseudolocalize Messages' (/tasks/pseudoloc.js)
config.pseudoloc = {
  all: {
    srcBase: 'i18n',
    srcLocale: 'en_us',
    destBase: 'build/i18n',
    pseudoLocale: 'en_ploc'
  }
};

// 'Compile messages' (/tasks/messages.js)
config.messages = {
  all: {
    locales: LOCALES,
    srcBases: ['i18n', 'build/i18n'],
    destBase: 'build/locale'
  }
};

// Create a symlink at /build/locale/current pointing to /build/locale/en_us so Blockly require() commands resolve correctly in dev mode.
// e.g. var commonMsg = require('../../locale/current/common');
// See also the Browserify transform localify() that translates this require path for compiled+minified apps.
config.symlink = {
  locale: {
    src: 'build/locale/en_us',
    dest: 'build/locale/current'
  }
};

// 'compile ejs templates' (/tasks/ejs.js)
config.ejs = {
  all: {
    srcBase: 'src',
    destBase: 'build/js'
  }
};

// These dependencies are externalized to a 'base' browserify bundle shared across all Blockly apps.
var externalRequires = [
  './build/js/base:../base',
  './build/js/skins:../skins',
  './build/locale/current/common:../../locale/current/common',
  './build/js/codegen:../codegen',
  './build/js/templates/page.html:../templates/page.html',
  './build/js/feedback.js:../feedback.js',
  './build/js/dom:../dom',
  './build/js/utils:../utils',
  './build/js/appMain:../appMain',
  './build/js/hammer:../hammer',
  './build/js/xml:../xml',
  './build/js/canvg/canvg.js:../canvg/canvg.js',
  './build/js/canvg/StackBlur.js:../canvg/StackBlur.js',
  './build/js/canvg/rgbcolor.js:../canvg/rgbcolor.js',
  './build/js/canvg/svg_todataurl:../canvg/svg_todataurl',
  './build/js/required_block_utils:../required_block_utils',
  './build/js/block_utils:../block_utils',
  './build/js/constants.js:../constants.js',
  './build/js/level_base:../level_base',
  './build/js/timeoutList:../timeoutList'
];

// Browserify is a tool for taking your CommonJS-style Javascript code and packaging it for use in the browser.
config.browserify = {};
APPS.forEach(function(app) {
  LOCALES.forEach(function(locale) {
    var src = 'build/js/' + app + '/main.js';
    var dest = 'build/browserified/' + locale + '/' + app + '.js';
    var files = {};
    files[dest] = [src];
    config.browserify[app + '_' + locale] = {
      files: files,
      options: {
        external: externalRequires,
        // Specifies a pipeline of functions (or modules) through which the browserified bundle will be run.
        transform: [localify(locale)]
      }
    };
  });
});

LOCALES.forEach(function(locale) {
  var src = 'build/js/base.js';
  var dest = 'build/browserified/' + locale + '/base.js';
  var files = {};
  files[dest] = [src];
  config.browserify['base_' + locale] = {
    files: files,
    options: {
      alias: externalRequires,
      require: ['base', 'skins', '../locale/current/common', 'codegen', 'templates/page.html',
        'feedback.js', 'dom', 'utils', 'appMain',
        'hammer', 'xml', 'canvg/canvg.js', 'canvg/StackBlur.js', 'canvg/rgbcolor.js', 'canvg/svg_todataurl',
        'required_block_utils', 'block_utils', 'constants.js', 'level_base', 'timeoutList'],
      transform: [localify(locale)]
    }
  }
});

config.concat = {};
LOCALES.forEach(function(locale) {
  var ext = DEV ? 'uncompressed' : 'compressed';
  config.concat['vendor_' + locale] = {
    nonull: true,
    src: [
      'lib/blockly/blockly_' + ext + '.js',
      'lib/blockly/blocks_' + ext + '.js',
      'lib/blockly/javascript_' + ext + '.js',
      'lib/blockly/' + locale + '.js'
    ],
    dest: 'build/package/js/' + locale + '/vendor.js'
  };
});

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
APPS.forEach(function(app) {
  LOCALES.forEach(function(locale) {
    var relname = locale + '/' + app;
    var src = 'build/browserified/' + relname + '.js';
    var dest = 'build/package/js/' + relname + '.min.js';
    uglifiedFiles[dest] = [src];
  });
});
config.uglify = {
  options: {
    mangle: !DEV,
    compress: !DEV
  },
  browserified: {
    files: uglifiedFiles
  }
};

config.watch = {
  js: {
    files: ['src/**/*.js'],
    tasks: ['copy:src', 'browserify', 'uglify:browserified', 'copy:browserified']
  },
  style: {
    files: ['style/**/*.scss', 'style/**/*.sass'],
    tasks: ['sass']
  },
  content: {
    files: ['static/**/*'],
    tasks: ['copy']
  },
  vendor_js: {
    files: ['lib/**/*.js'],
    tasks: ['concat', 'copy:lib']
  },
  ejs: {
    files: ['src/**/*.ejs'],
    tasks: ['ejs', 'browserify', 'uglify:browserified', 'copy:browserified']
  },
  messages: {
    files: ['i18n/**/*.json'],
    tasks: ['pseudoloc', 'messages', 'browserify', 'uglify:browserified', 'copy:browserified']
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

module.exports = function(grunt) {

  grunt.initConfig(config);

  // `watch`: Run tasks whenever watched files change.
  // https://github.com/gruntjs/grunt-contrib-watch
  grunt.loadNpmTasks('grunt-contrib-watch');
  // `clean`: Clear files and folders.
  // https://github.com/gruntjs/grunt-contrib-clean
  grunt.loadNpmTasks('grunt-contrib-clean');
  // `copy`: Copy files and folders.
  // https://github.com/gruntjs/grunt-contrib-copy
  grunt.loadNpmTasks('grunt-contrib-copy');
  // `symlink`: Create symbolic links.
  // https://github.com/gruntjs/grunt-contrib-symlink
  grunt.loadNpmTasks('grunt-contrib-symlink');
  // `concat`: Concatenate files.
  // https://github.com/gruntjs/grunt-contrib-concat
  grunt.loadNpmTasks('grunt-contrib-concat');
  // `jshint`: Validate files with JSHint.
  // https://github.com/gruntjs/grunt-contrib-jshint
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // `uglify`: Minify files with UglifyJS.
  // https://github.com/gruntjs/grunt-contrib-uglify
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // `lodash`: A Grunt wrapper around the Lo-Dash command-line interface, lodash-cli.
  // https://github.com/lodash/grunt-lodash
  grunt.loadNpmTasks('grunt-lodash');
  // `express`: Start an Express.js web server using grunt.js.
  // https://github.com/blai/grunt-express
  grunt.loadNpmTasks('grunt-express');
  // `browserify`: Grunt task for node-browserify.
  // https://github.com/jmreidy/grunt-browserify
  grunt.loadNpmTasks('grunt-browserify');
  // `sass`: Compile Sass to CSS.
  // https://github.com/gruntjs/grunt-contrib-sass
  grunt.loadNpmTasks('grunt-sass');
  // `mochaTest`: A grunt task for running server side mocha tests.
  // https://github.com/pghalliday/grunt-mocha-test
  grunt.loadNpmTasks('grunt-mocha-test');
  // `strip_code`: A GruntJS task to remove dev and test only code blocks from production builds.
  // https://github.com/nuzzio/grunt-strip-code
  grunt.loadNpmTasks('grunt-strip-code');
  // Automatic Notifications when Grunt tasks fail.
  // https://github.com/dylang/grunt-notify
  grunt.loadNpmTasks('grunt-notify');

  // Custom tasks from /tasks directory
  grunt.loadTasks('tasks');

  // `grunt build` runs the following tasks in order specified.
  // http://gruntjs.com/api/grunt.task#grunt.task.registertask
  grunt.registerTask('build', [
    'pseudoloc',
    'messages',
    'symlink:locale',
    'copy:src',
    'strip_code',
    'ejs',
    'browserify',
    'uglify:browserified',
    'copy:browserified',
    'copy:static',
    'copy:lib',
    'concat',
    'sass'
  ]);

  grunt.registerTask('rebuild', ['clean', 'build']);
  grunt.registerTask('dev', ['express:server', 'watch']);
  grunt.registerTask('test', ['jshint', 'mochaTest']);

  grunt.registerTask('default', ['rebuild', 'test']);

  config.mochaTest.all.options.grep = new RegExp(grunt.option('grep'));
};
