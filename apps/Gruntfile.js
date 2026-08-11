var chalk = require('chalk');
var child_process = require('child_process');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var pyodide = require('pyodide');
var sass = require('sass');

const {BUNDLERS, resolveBundler} = require('./bundlerBase');
var envConstants = require('./envConstants');
const {VALID_KARMA_CLI_FLAGS} = require('./karma.conf');
var checkEntryPoints = require('./script/checkEntryPoints');
const {createWebpackConfig} = require('./webpack.config');
const {ALL_APPS, appsEntriesFor} = require('./webpackEntryPoints');

// Review every couple of years to see if an increase improves test performance
const MEM_PER_TEST_PROCESS_MB = 4300;

module.exports = function (grunt) {
  // Enable time-grunt for detailed task timing if profiling is enabled
  if (envConstants.PROFILE_APPS_BUILD) {
    require('time-grunt')(grunt);
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

  /** @const {string} */
  var SINGLE_APP = grunt.option('app') || envConstants.APP;
  var appsToBuild = SINGLE_APP ? [SINGLE_APP] : ALL_APPS;

  var ace_suffix = envConstants.DEV ? '' : '-min';
  var piskelRootStdout = child_process.execSync('npx piskel-root');
  var piskelRoot = String(piskelRootStdout).replace(/\s+$/g, '');
  var PISKEL_DEVELOPMENT_MODE = grunt.option('piskel-dev');
  if (PISKEL_DEVELOPMENT_MODE) {
    var localNodeModulesRoot = String(
      child_process.execSync('npm prefix')
    ).replace(/\s+$/g, '');
    if (piskelRoot.indexOf(localNodeModulesRoot) === -1) {
      // Piskel has been linked to a local development repo, we're good to go.
      piskelRoot = path.resolve(piskelRoot, '..', 'dev');
      console.log(chalk.bold.yellow('-- PISKEL DEVELOPMENT MODE --'));
      console.log(
        chalk.yellow('Make sure you have a local development build of piskel')
      );
      console.log(chalk.yellow('Inlining PISKEL_DEVELOPMENT_MODE=true'));
      console.log(
        chalk.yellow(
          'Copying development build of Piskel instead of release build'
        )
      );
    } else {
      console.log(chalk.bold.red('Unable to enable Piskel development mode.'));
      console.log(
        chalk.red(
          'In order to use Piskel development mode, your apps ' +
            'package must be linked to a local development copy of the Piskel ' +
            'repository with a complete dev build.' +
            '\n' +
            '\n  1. git clone https://github.com/code-dot-org/piskel.git <new-directory>' +
            '\n  2. cd <new-directory>' +
            '\n  3. npm install && grunt build-dev' +
            '\n  4. npm link' +
            '\n  5. cd <code-dot-org apps directory>' +
            '\n  6. npm link @code-dot-org/piskel' +
            '\n  7. rerun your previous command' +
            '\n'
        )
      );
      process.exitCode = 1; // Failure!
      return;
    }
  }

  config.copy = {
    src: {
      files: [
        {
          expand: true,
          cwd: 'src/',
          src: ['**/*.js', '**/*.jsx'],
          dest: 'build/js',
        },
      ],
    },
    static: {
      files: [
        {
          expand: true,
          cwd: 'static/',
          src: ['**'],
          dest: 'build/package/media',
        },
        {
          expand: true,
          cwd: 'lib/blockly/media',
          src: ['**'],
          //TODO: Would be preferrable to separate Blockly media.
          dest: 'build/package/media',
        },
        {
          expand: true,
          cwd: 'node_modules/blockly/media',
          src: ['**'],
          dest: 'build/package/media/google_blockly',
        },
        {
          expand: true,
          cwd: 'node_modules/@code-dot-org/craft/dist/assets',
          src: ['**'],
          dest: 'build/package/media/skins/craft',
        },
        {
          expand: true,
          cwd: 'node_modules/@code-dot-org/ml-activities/dist',
          src: ['assets/**'],
          dest: 'build/package/media/skins/fish',
        },
        {
          expand: true,
          cwd: 'node_modules/@code-dot-org/ml-playground/dist/assets',
          src: ['**'],
          dest: 'build/package/media/skins/ailab',
        },
        {
          // @code-dot-org/ailab emits both images and datasets under dist/assets
          expand: true,
          cwd: 'node_modules/@code-dot-org/ailab/dist/assets',
          src: ['**'],
          dest: 'build/package/media/skins/ailab',
        },
        {
          // ml-playground images are emitted to dist/images, not dist/assets.
          expand: true,
          cwd: 'node_modules/@code-dot-org/ml-playground/dist',
          src: ['images/**'],
          dest: 'build/package/media/skins/ailab',
        },

        // We have to do some weird stuff to get our fallback video player working.
        // video.js expects some of its own files to be served by the application, so
        // we include them in our build and access them via static (non-fingerprinted)
        // root-relative paths.
        // We may have to do something similar with ace editor later, but generally
        // we'd prefer to avoid this way of doing things.
        // TODO: At some point, we may want to better rationalize the package
        // structure for all of our different assets (including vendor assets,
        // blockly media, etc).
        {
          expand: true,
          cwd: './node_modules/video.js/dist',
          src: ['**'],
          dest: 'build/package/video-js',
        },
      ],
    },
    lib: {
      files: [
        {
          expand: true,
          cwd: 'lib/blockly',
          src: ['*_*.js'],
          dest: 'build/locales',
          // e.g., ar_sa.js -> ar_sa/blockly_locale.js
          rename: function (dest, src) {
            var outputPath = src.replace(
              /(.+_.+)\.js/g,
              '$1/blockly_locale.js'
            );
            return path.join(dest, outputPath);
          },
        },
        // minifying ace code requires some advanced configuration:
        // https://github.com/ajaxorg/ace/blob/b808ac14ec6d6afa74b36ff5c03452a2832b32a4/Makefile.dryice.js#L620-L638
        // instead of replicating that configuration here, we keep minified
        // and unminified js in our repo and provide the correct one
        // based on whether we are in development or production mode.
        {
          expand: true,
          cwd: 'lib/ace/src' + ace_suffix + '-noconflict/',
          src: ['**/*.js'],
          dest: 'build/package/js/ace/',
        },
        // Pull p5.js and p5.play.js into the package from our forks. These are
        // needed by the gamelab exporter code in production and development.
        {
          expand: true,
          cwd: './node_modules/@code-dot-org/p5/lib',
          src: ['p5.js'],
          dest: 'build/package/js/p5play/',
        },
        {
          expand: true,
          cwd: './node_modules/@code-dot-org/p5.play/lib',
          src: ['p5.play.js'],
          dest: 'build/package/js/p5play/',
        },
        // Piskel must not be minified or digested in order to work properly.
        {
          expand: true,
          // For some reason, if we provide piskel root as an absolute path here,
          // our dest ends up with an empty set of directories matching the path
          // If we provide it as a relative path, that does not happen
          cwd: './' + path.relative(process.cwd(), piskelRoot),
          src: ['**'],
          dest: 'build/package/js/piskel/',
        },
        {
          expand: true,
          cwd: 'lib/droplet',
          src: ['droplet-full*.js'],
          dest: 'build/minifiable-lib/droplet/',
        },
        {
          expand: true,
          cwd: 'lib/droplet',
          src: ['droplet.min.css'],
          dest: 'build/package/css/droplet/',
        },
        {
          expand: true,
          cwd: 'lib/tooltipster',
          src: ['*.js'],
          dest: 'build/minifiable-lib/tooltipster/',
        },
        {
          expand: true,
          cwd: 'lib/phaser',
          src: ['*.js'],
          dest: 'build/minifiable-lib/phaser/',
        },
        {
          expand: true,
          cwd: 'lib/tooltipster',
          src: ['tooltipster.min.css'],
          dest: 'build/package/css/tooltipster/',
        },
        {
          expand: true,
          cwd: 'lib/fileupload',
          src: ['*.js'],
          dest: 'build/minifiable-lib/fileupload/',
        },
        {
          expand: true,
          cwd: 'lib/pyodide',
          src: ['*.whl', '*.zip'],
          dest: `build/package/js/pyodide/${pyodide.version}`,
        },
      ],
    },
    unhash: {
      files: [
        {
          expand: true,
          cwd: 'build/package/js',
          // The applab and gamelab exporters need unhashed copies of these files.
          src: [
            'webpack-runtimewp*.js',
            'webpack-runtimewp*.min.js',
            'applab-apiwp*.js',
            'applab-apiwp*.min.js',
            'gamelab-apiwp*.js',
            'gamelab-apiwp*.min.js',
          ],
          dest: 'build/package/js',
          // e.g. webpack-runtimewp0123456789aabbccddee.min.js --> webpack-runtime.min.js
          rename: function (dest, src) {
            var outputFile = src.replace(/wp[0-9a-f]{16,20}/, '');
            return path.join(dest, outputFile);
          },
        },
      ],
    },
  };

  config.sass = {
    all: {
      options: {
        // Compression currently occurs at the ../dashboard sprockets layer.
        // dart-sass: Only the "expanded" and "compressed" values of outputStyle are supported.
        outputStyle: 'expanded',
        includePaths: ['node_modules', '../shared/css/'],
        implementation: sass,
        quietDeps: true,
      },
      files: _.fromPairs(
        [
          ['build/package/css/common.css', 'style/common.scss'],
          [
            'build/package/css/code-studio.css',
            'style/code-studio/code-studio.scss',
          ],
          [
            'build/package/css/certificates.css',
            'style/curriculum/certificates.scss',
          ],
          ['build/package/css/courses.css', 'style/curriculum/courses.scss'],
          ['build/package/css/scripts.css', 'style/curriculum/scripts.scss'],
          ['build/package/css/lessons.css', 'style/curriculum/lessons.scss'],
          ['build/package/css/markdown.css', 'style/curriculum/markdown.scss'],
          ['build/package/css/levels.css', 'style/curriculum/levels.scss'],
          ['build/package/css/rollups.css', 'style/curriculum/rollups.scss'],
          [
            'build/package/css/curriculum_table_styling.css',
            'style/curriculum/curriculum_table_styling.scss',
          ],
          [
            'build/package/css/curriculum_navigation.css',
            'style/curriculum/navigation.scss',
          ],
          [
            'build/package/css/levelbuilder.css',
            'style/code-studio/levelbuilder.scss',
          ],
          [
            'build/package/css/leveltype_widget.css',
            'style/code-studio/leveltype_widget.scss',
          ],
          ['build/package/css/plc.css', 'style/code-studio/plc.scss'],
          ['build/package/css/pd.css', 'style/code-studio/pd.scss'],
          ['build/package/css/petition.css', 'style/code-studio/petition.scss'],
          [
            'build/package/css/publicKeyCryptography.css',
            'style/publicKeyCryptography/publicKeyCryptography.scss',
          ],
          [
            'build/package/css/foorm_editor.css',
            'style/code-studio/foorm_editor.scss',
          ],
        ].concat(
          appsToBuild.map(function (app) {
            return [
              'build/package/css/' + app + '.css', // dst
              'style/' + app + '/style.scss', // src
            ];
          })
        )
      ),
    },
  };

  // Takes a key-value .json file and runs it through MessageFormat to create a localized .js file.
  config.messages = {
    all: {
      options: {
        dest: 'build/locales',
      },
      files: [
        {
          // e.g., build/js/i18n/bounce/ar_sa.json -> build/package/js/ar_sa/bounce_locale.js
          rename: function (dest, src) {
            var outputPath = src.replace(
              /(build\/)?i18n\/(\w*)\/(\w+_\w+).json/g,
              '$3/$2_locale.js'
            );
            return path.join(dest, outputPath);
          },
          expand: true,
          src: ['i18n/**/*.json'],
          dest: 'build/locales',
        },
      ],
    },
  };

  config.ejs = {
    all: {
      srcBase: 'src',
      destBase: 'build/js',
    },
  };

  // One source for the Node heap given to rspack: APPS_BUILD_MAX_MEMORY,
  // the same knob build-in-parallel.sh uses (it exports the value).
  // Always set explicitly — every documented entry point reaches here
  // with NODE_OPTIONS already in the environment (the yarn `grunt`
  // script sets 4096MB), and that value is sized for grunt itself, not
  // for a full rspack build.  Appending rather than replacing keeps any
  // other flags the caller passed (--inspect, say); node takes the last
  // --max-old-space-size, so ours is the one that applies.
  const buildMaxMemory = /^\d+$/.test(process.env.APPS_BUILD_MAX_MEMORY || '')
    ? process.env.APPS_BUILD_MAX_MEMORY
    : 8192;
  if (
    process.env.APPS_BUILD_MAX_MEMORY &&
    !/^\d+$/.test(process.env.APPS_BUILD_MAX_MEMORY)
  ) {
    grunt.log.warn(
      `APPS_BUILD_MAX_MEMORY=${process.env.APPS_BUILD_MAX_MEMORY} is not a number of megabytes; using ${buildMaxMemory}.`
    );
  }
  // The rspack build runs in a child process, so grunt options the
  // webpack path consumes in-process must cross as environment
  // variables: --app as APP (rspack.config.js's entry default) and
  // --piskel-dev as PISKEL_DEV.  These go through grunt-exec's `options`
  // rather than a prefix on the command string, so no value needs shell
  // quoting — an app name with a space, or a NODE_OPTIONS carrying
  // `--require "/path with spaces/x.js"`, would otherwise garble the
  // command.  child_process.exec replaces the environment wholesale when
  // given one, hence the spread.
  const rspackEnv = {
    ...process.env,
    ...(SINGLE_APP ? {APP: SINGLE_APP} : {}),
    ...(PISKEL_DEVELOPMENT_MODE ? {PISKEL_DEV: '1'} : {}),
    ...('RSPACK_SWC' in process.env ? {} : {RSPACK_SWC: 'all'}),
    NODE_OPTIONS: `${
      process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS + ' ' : ''
    }--max-old-space-size=${buildMaxMemory}`,
  };

  config.exec = {
    // `--rspack` (or APPS_BUNDLER=rspack) swaps only the JS bundling
    // step of `grunt build`; every other task (sass, locales, copies,
    // karma) is bundler-independent and runs unchanged.  RSPACK_SWC
    // defaults to the full-swc mode here because this path exists to
    // prove the production story; see rspack.config.js.  NODE_ENV is
    // pinned from DEV — the same switch that selects webpack:build vs
    // webpack:uglify and gates uglify:lib and copy:unhash in the build
    // task — so the child's minify decision cannot disagree with the
    // grunt steps around it.  (Left to the rspack CLI, NODE_ENV would
    // default to production and silently minify dev builds.)
    rspackBuild: {
      command: 'node node_modules/.bin/rspack build --config rspack.config.js',
      options: {
        env: {
          ...rspackEnv,
          NODE_ENV: envConstants.DEV ? 'development' : 'production',
        },
      },
    },
    // The dev server is development by definition, so NODE_ENV is
    // pinned outright (an exported NODE_ENV=production in the calling
    // shell would otherwise serve minified).  Full-swc here too: it is
    // the mode every browser and drone verification ran in, and the
    // hybrid RSPACK_SWC=ts fallback starts several times slower.
    // prepareBundlerOutputDir cleans the output directory beforehand
    // (a populated one costs rspack ~18s of startup), and doing it
    // there rather than here keeps prebuild's copied assets.
    rspackServe: {
      command: 'node node_modules/.bin/rspack serve --config rspack.config.js',
      options: {env: {...rspackEnv, NODE_ENV: 'development'}},
    },
    convertScssVars: './script/convert-scss-variables.js',
    generateSharedConstants: 'bundle exec ./script/generateSharedConstants.rb',
    generateRegionConfigurations:
      'bundle exec ./script/generateRegionConfigurations.rb',
    generateStudioRoutes: 'bundle exec ./script/generateStudioRoutes.rb',
    buildFrontendDependencies: './script/build-frontend-dependencies.sh',
    watchFrontendDependencies:
      './script/build-frontend-dependencies.sh --watch',
  };

  grunt.registerTask('karma', ['preconcatForKarma', 'karma start']);
  grunt.registerTask('karma start', () => {
    // Forward select grunt command-line flags to `karma start`
    const KARMA_CLI_FLAGS = VALID_KARMA_CLI_FLAGS.flatMap(arg =>
      grunt.option(arg) ? [`--${arg}`, grunt.option(arg)] : []
    );

    console.log(chalk.green(`>> npx karma start ${KARMA_CLI_FLAGS.join(' ')}`));
    child_process.spawnSync('npx', ['karma', 'start', ...KARMA_CLI_FLAGS], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: `--max-old-space-size=${MEM_PER_TEST_PROCESS_MB}`,
      },
    });
  });

  grunt.registerTask('preconcatForKarma', [
    'exec:generateSharedConstants',
    'newer:messages',
    'exec:convertScssVars',
    'exec:generateRegionConfigurations',
    'exec:generateStudioRoutes',
    'newer:copy:static',
  ]);

  config.clean = {
    build: ['build'],
    karma: {
      options: {force: true},
      src: ['build/karma'],
    },
  };

  const piskelDevMode = PISKEL_DEVELOPMENT_MODE;

  // Create a webpack entry point for each of the apps in `appsToBuild`.
  // See `ALL_APPS` in webpackEntryPoints.js for a list of valid apps, e.g.
  // gamelab, maze, etc.
  var appsEntries = appsEntriesFor(appsToBuild);

  config.webpack = {
    build: createWebpackConfig({
      appsEntries,
      piskelDevMode,
    }),

    uglify: createWebpackConfig({
      appsEntries,
      piskelDevMode,
      minify: true,
    }),
  };

  // This is started by `yarn start`, and is the normal dev mode with HMR
  config['webpack-dev-server'] = {
    dev: createWebpackConfig({
      appsEntries,
      piskelDevMode,
    }),
  };

  config.uglify = {
    lib: {
      files: _.fromPairs(
        ['p5play/p5.play.js', 'p5play/p5.js'].map(function (src) {
          return [
            'build/package/js/' + src.replace(/\.js$/, '.min.js'), // dst
            'build/package/js/' + src, // src
          ];
        })
      ),
    },
  };

  config.watch = {
    // JS files watched by webpack
    style: {
      files: ['style/**/*.scss', 'style/**/*.sass'],
      tasks: ['newer:sass'],
      options: {
        interval: DEV_WATCH_INTERVAL,
        interrupt: true,
      },
    },
    content: {
      files: ['static/**/*'],
      tasks: ['newer:copy'],
      options: {
        interval: DEV_WATCH_INTERVAL,
      },
    },
    vendor_js: {
      files: ['lib/**/*.js'],
      tasks: ['newer:copy:lib'],
      options: {
        interval: DEV_WATCH_INTERVAL,
      },
    },
    messages: {
      files: ['i18n/**/*.json'],
      tasks: ['messages'],
      options: {
        interval: DEV_WATCH_INTERVAL,
      },
    },
  };

  config.concurrent = {
    // run our watch tasks concurrently so that they dont block each other
    watch: {
      tasks: ['watch', 'webpack-dev-server', 'exec:watchFrontendDependencies'],
      options: {
        logConcurrentOutput: true,
      },
    },
    // Same set as `watch` above, with the rspack dev server in place of
    // webpack's: both need the frontend/ package rebuilds.
    watchRspack: {
      tasks: ['watch', 'exec:rspackServe', 'exec:watchFrontendDependencies'],
      options: {
        logConcurrentOutput: true,
      },
    },
  };

  grunt.initConfig(config);

  // grunt-newer compares each Sass entry file's mtime against its compiled
  // output, so it never notices a change to a partial pulled in only via
  // @import. Force a full recompile when the changed file isn't one of the
  // known entries, so partial edits actually take effect.
  var sassEntryFiles = new Set(_.values(config.sass.all.files));
  grunt.event.on('watch', function (action, filepath, target) {
    if (target !== 'style') {
      return;
    }
    var tasks = sassEntryFiles.has(filepath) ? ['newer:sass'] : ['sass:all'];
    grunt.config(['watch', 'style', 'tasks'], tasks);
  });

  // Autoload grunt tasks
  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', '!grunt-lib-contrib'],
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('noop', function () {});

  // Generate locale stub files in the build/locale/current folder
  grunt.registerTask('locales', function () {
    var current = path.resolve('build/locale/current');
    child_process.execSync('mkdir -p ' + current);
    appsToBuild
      .concat('common', 'regionalPartnerSearch', 'regionalPartnerMiniContact')
      .map(function (item) {
        var localeType = item === 'common' ? 'locale' : 'appLocale';
        var localeString =
          '/*' +
          item +
          '*/ ' +
          'module.exports = window.locales.' +
          localeType +
          ';';
        fs.writeFileSync(path.join(current, item + '.js'), localeString);
      });
  });

  // Checks the size of Droplet to ensure it's built with LANGUAGE=javascript
  grunt.registerTask('checkDropletSize', function () {
    var bytes = fs.statSync('lib/droplet/droplet-full.min.js').size;
    if (bytes > 500 * 1000) {
      grunt.warn(
        '"droplet-full.min.js" is larger than 500kb. Did you build with LANGUAGE=javascript?'
      );
    }
  });

  grunt.registerTask('prebuild', [
    'checkDropletSize',
    'lint-entry-points',
    'exec:generateSharedConstants',
    'newer:messages',
    'exec:convertScssVars',
    'exec:generateRegionConfigurations',
    'exec:generateStudioRoutes',
    'newer:copy:src',
    'newer:copy:lib',
    'locales',
    'ejs',
    'detect-production-webpack-chunks',
    'exec:buildFrontendDependencies',
  ]);

  grunt.registerTask('check-entry-points', function () {
    const done = this.async();
    checkEntryPoints(config.webpack.build, {verbose: true}).then(stats =>
      done()
    );
  });

  grunt.registerTask('lint-entry-points', function () {
    const done = this.async();
    checkEntryPoints(config.webpack.build).then(stats => {
      console.log(
        [
          chalk.green(`[${stats.passed} passed]`),
          stats.silenced && chalk.yellow(`[${stats.silenced} silenced]`),
          stats.failed && chalk.red(`[${stats.failed} failed]`),
        ]
          .filter(f => f)
          .join(' ')
      );
      if (stats.failed > 0) {
        grunt.warn(
          `${stats.failed} entry points do not conform to naming conventions.\n` +
            `Run grunt check-entry-points for details.\n`
        );
      }
      done();
    });
  });

  grunt.registerTask('detect-production-webpack-chunks', function () {
    if (
      process.env.DEV &&
      fs.existsSync('./build/package/js/code-studio-common.js')
    ) {
      grunt.warn(
        'You are building in dev mode (DEV=1), but the build/ directory already contains production Webpack chunks, such as code-studio-common.js.\n' +
          'These will not be overwritten by a dev build, and their presence will cause loading errors in some labs (e.g., Applab).\n' +
          "Note that after cleaning your build directory, some static assets that aren't rebuilt via yarn start may not load.\n" +
          'These can be regenerated via yarn build.\n' +
          'Run yarn clean (then yarn build) and try again.'
      );
    }
  });

  grunt.registerTask('postbuild', ['newer:copy:static', 'newer:sass']);

  // `yarn start --rspack` / `yarn build --rspack` / `yarn build:dist
  // --rspack` opt into the rspack bundler for one run; APPS_BUNDLER is
  // the env-var form for CI and scripts.  bundlerBase owns the default,
  // where a test guards it.
  const APPS_BUNDLER = resolveBundler({rspackFlag: !!grunt.option('rspack')});
  if (
    process.env.APPS_BUNDLER &&
    !BUNDLERS.includes(process.env.APPS_BUNDLER)
  ) {
    grunt.log.warn(
      `Unrecognized APPS_BUNDLER value ${process.env.APPS_BUNDLER}; building with ${APPS_BUNDLER}.`
    );
  }
  const rspackNotice = () => {
    if (APPS_BUNDLER === 'rspack') {
      grunt.log.writeln(
        '[rspack] Bundling with rspack (opt-in). swc and babel can transpile edge cases differently, so check your change under the default webpack build before shipping.'
      );
    }
  };

  // The two bundlers share build/package/js.  Leftovers from the other
  // one are never *referenced* (each build rewrites everything a page
  // loads), but they accumulate gigabytes over weeks — so a marker file
  // records who wrote the directory, and switching cleans it.  Under
  // `serve`, rspack additionally cleans every start, switch or not: its
  // writeToDisk step compares against every existing file, and starting
  // over a populated directory costs ~18s.  A one-shot build pays no
  // such penalty and keeps its predecessor's output.
  //
  // The marker lives beside the packaged directory rather than inside
  // it: deployment tars build/package wholesale, excluding only
  // *.cache.json, so a marker under js/ would ship to the servers.
  //
  // Runs before prebuild, so the static assets prebuild copies into
  // build/package/js (ace, piskel, p5play, the pyodide wheels) are put
  // back after the clean rather than wiped by it — grunt-newer recopies
  // them because their destinations are gone.
  const prepareBundlerOutputDir = ({serve = false} = {}) => {
    const dir = path.resolve(__dirname, 'build/package/js');
    const marker = path.resolve(__dirname, 'build/.bundler');
    // Output that predates the marker is grandfathered as webpack's:
    // that is what it was in practice, and it keeps rollout quiet for
    // developers who never opt into rspack.
    const prev = fs.existsSync(marker)
      ? fs.readFileSync(marker, 'utf8').trim()
      : fs.existsSync(dir) && fs.readdirSync(dir).length > 0
      ? 'webpack'
      : null;
    if (prev && prev !== APPS_BUNDLER) {
      grunt.log.writeln(
        `[build] switching ${prev} -> ${APPS_BUNDLER}: cleaning build/package/js of the previous output`
      );
      fs.rmSync(dir, {recursive: true, force: true});
    } else if (serve && APPS_BUNDLER === 'rspack' && prev) {
      fs.rmSync(dir, {recursive: true, force: true});
    }
    fs.mkdirSync(dir, {recursive: true});
    fs.mkdirSync(path.dirname(marker), {recursive: true});
    fs.writeFileSync(marker, APPS_BUNDLER + '\n');
  };

  grunt.registerTask('build', function () {
    rspackNotice();
    prepareBundlerOutputDir();
    grunt.task.run([
      'prebuild',
      // For any minifiable libs, generate minified sources if they do not already
      // exist in our repo. Skip minification in development environment.
      envConstants.DEV ? 'noop' : 'uglify:lib',
      // exec:rspackBuild pins NODE_ENV from the same DEV switch used
      // above and below, so one exec target covers both dev and
      // production builds without disagreeing with uglify:lib or
      // copy:unhash.
      APPS_BUNDLER === 'rspack'
        ? 'exec:rspackBuild'
        : envConstants.DEV
        ? 'webpack:build'
        : 'webpack:uglify',
      'postbuild',
      envConstants.DEV ? 'noop' : 'newer:copy:unhash',
    ]);
  });

  grunt.registerTask('rebuild', ['clean', 'build']);

  grunt.registerTask('dev', function () {
    // Unless explicitly overridden, set HOT=1 and DEV=1 when running `grunt dev`
    process.env.HOT ||= 1;
    process.env.DEV ||= 1;
    rspackNotice();
    prepareBundlerOutputDir({serve: true});
    grunt.task.run([
      'prebuild',
      'newer:sass',
      APPS_BUNDLER === 'rspack' ? 'concurrent:watchRspack' : 'concurrent:watch',
      'postbuild',
    ]);
  });

  grunt.registerTask('default', ['rebuild', 'test']);
};

// Exported for matching use in `run-tests-in-parallel.sh`
module.exports.MEM_PER_TEST_PROCESS_MB = MEM_PER_TEST_PROCESS_MB;
