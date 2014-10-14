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
  'webapp'
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
  'en_ploc'
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
      },
      {
        expand: true,
        cwd: 'lib/js-numbers/',
        src: ['js-numbers.js'],
        dest: 'build/package/js/js-numbers/'
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
APPS.forEach(function(app) {
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

config.messages = {
  all: {
    locales: LOCALES,
    srcBases: ['i18n', 'build/i18n'],
    destBase: 'build/locale'
  }
};

config.symlink = {
  locale: {
    src: 'build/locale/en_us',
    dest: 'build/locale/current'
  }
};

config.ejs = {
  all: {
    srcBase: 'src',
    destBase: 'build/js'
  }
};

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
        transform: [localify(locale)]
      }
    };
  });
});

config.concat = {
  lib: {
    src: ['lib/cdo/*.js'],
    dest: 'build/package/js/cdo/lib.js'
  }
};
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

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-symlink');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-lodash');
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-strip-code');
  grunt.loadNpmTasks('grunt-notify');

  grunt.loadTasks('tasks');

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
