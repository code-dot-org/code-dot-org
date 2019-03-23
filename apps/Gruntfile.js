var chalk = require('chalk');
var child_process = require('child_process');
var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var _ = require('lodash');
var logBuildTimes = require('./script/log-build-times');
var webpackConfig = require('./webpack');
var envConstants = require('./envConstants');
var checkEntryPoints = require('./script/checkEntryPoints');
var {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
var {StatsWriterPlugin} = require('webpack-stats-plugin');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = function(grunt) {
  // Decorate grunt to record and report build durations.
  var buildTimeLogger = logBuildTimes(grunt);

  process.env.mocha_entry = grunt.option('entry') || '';
  if (process.env.mocha_entry) {
    if (
      path.resolve(process.env.mocha_entry).indexOf('/apps/test/integration') >
      -1
    ) {
      throw new Error('Cannot use karma:entry to run integration tests');
    }
    const isDirectory = fs
      .lstatSync(path.resolve(process.env.mocha_entry))
      .isDirectory();
    const loadContext = isDirectory
      ? `let testsContext = require.context(${JSON.stringify(
          path.resolve(process.env.mocha_entry)
        )}, true, /\\.jsx?$/);`
      : '';
    const runTests = isDirectory
      ? 'testsContext.keys().forEach(testsContext);'
      : `require('${path.resolve(process.env.mocha_entry)}');`;
    const file = `/* eslint-disable */
// Auto-generated from Gruntfile.js
import 'babel-polyfill';
import 'whatwg-fetch';
import { throwOnConsoleErrorsEverywhere, throwOnConsoleWarningsEverywhere } from './util/testUtils';
${loadContext}
describe('entry tests', () => {
  throwOnConsoleErrorsEverywhere();
  throwOnConsoleWarningsEverywhere();
  ${runTests}
});
`;
    fs.writeFileSync('test/entry-tests.js', file);
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

  /** @const {string[]} */
  var ALL_APPS = [
    'applab',
    'bounce',
    'calc',
    'craft',
    'dance',
    'eval',
    'flappy',
    'gamelab',
    'jigsaw',
    'maze',
    'netsim',
    'studio',
    'turtle',
    'scratch',
    'weblab'
  ];

  if (SINGLE_APP && ALL_APPS.indexOf(SINGLE_APP) === -1) {
    throw new Error('Unknown app: ' + SINGLE_APP);
  }

  var appsToBuild = SINGLE_APP ? [SINGLE_APP] : ALL_APPS;

  var ace_suffix = envConstants.DEV ? '' : '-min';
  var piskelRoot = String(
    child_process.execSync('`npm bin`/piskel-root')
  ).replace(/\s+$/g, '');
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
          cwd: 'node_modules/@code-dot-org/craft/dist/assets',
          src: ['**'],
          dest: 'build/package/media/skins/craft'
        },
        {
          expand: true,
          cwd: 'node_modules/scratch-blocks/media',
          src: ['**'],
          dest: 'build/package/media/scratch-blocks'
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
          cwd: './node_modules/video.js/dist/video-js',
          src: ['**'],
          dest: 'build/package/video-js'
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
          rename: function(dest, src) {
            var outputPath = src.replace(
              /(.{2}_.{2})\.js/g,
              '$1/blockly_locale.js'
            );
            return path.join(dest, outputPath);
          }
        },
        {
          expand: true,
          cwd: 'lib/ace/src' + ace_suffix + '-noconflict/',
          src: ['**/*.js'],
          dest: 'build/package/js/ace/'
        },
        // Pull p5.js and p5.play.js into the package from our fork of the
        // p5.play repo at https://github.com/code-dot-org/p5.play
        {
          expand: true,
          cwd: './node_modules/@code-dot-org/p5.play/examples/lib',
          src: ['p5.js'],
          dest: 'build/package/js/p5play/'
        },
        {
          expand: true,
          cwd: './node_modules/@code-dot-org/p5.play/lib',
          src: ['p5.play.js'],
          dest: 'build/package/js/p5play/'
        },
        {
          expand: true,
          cwd: 'lib',
          src: ['p5.sound.min.js'],
          dest: 'build/package/js/p5play/'
        },
        {
          expand: true,
          // For some reason, if we provide piskel root as an absolute path here,
          // our dest ends up with an empty set of directories matching the path
          // If we provide it as a relative path, that does not happen
          cwd: './' + path.relative(process.cwd(), piskelRoot),
          src: ['**'],
          dest: 'build/package/js/piskel/'
        },
        {
          expand: true,
          cwd: './node_modules/@code-dot-org/bramble/dist',
          src: ['**'],
          dest: 'build/package/js/bramble/'
        },
        {
          expand: true,
          cwd: 'lib/droplet',
          src: ['droplet-full*.js'],
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
          cwd: 'lib/tooltipster',
          src: ['*.js'],
          dest: 'build/package/js/tooltipster/'
        },
        {
          expand: true,
          cwd: 'lib/marked',
          src: ['marked*.js'],
          dest: 'build/package/js/marked/'
        },
        {
          expand: true,
          cwd: 'lib/phaser',
          src: ['*.js'],
          dest: 'build/package/js/phaser/'
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
          src: ['*.js'],
          dest: 'build/package/js/fileupload/'
        }
      ]
    }
  };

  config.sass = {
    all: {
      options: {
        // Compression currently occurs at the ../dashboard sprockets layer.
        outputStyle: 'nested',
        includePaths: ['node_modules', '../shared/css/']
      },
      files: _.fromPairs(
        [
          ['build/package/css/common.css', 'style/common.scss'],
          [
            'build/package/css/code-studio.css',
            'style/code-studio/code-studio.scss'
          ],
          [
            'build/package/css/levelbuilder.css',
            'style/code-studio/levelbuilder.scss'
          ],
          [
            'build/package/css/leveltype_widget.css',
            'style/code-studio/leveltype_widget.scss'
          ],
          ['build/package/css/plc.css', 'style/code-studio/plc.scss'],
          ['build/package/css/pd.css', 'style/code-studio/pd.scss'],
          [
            'build/package/css/publicKeyCryptography.css',
            'style/publicKeyCryptography/publicKeyCryptography.scss'
          ]
        ].concat(
          appsToBuild.map(function(app) {
            return [
              'build/package/css/' + app + '.css', // dst
              'style/' + app + '/style.scss' // src
            ];
          })
        )
      )
    }
  };

  // Takes a key-value .json file and runs it through MessageFormat to create a localized .js file.
  config.messages = {
    all: {
      files: [
        {
          // e.g., build/js/i18n/bounce/ar_sa.json -> build/package/js/ar_sa/bounce_locale.js
          rename: function(dest, src) {
            var outputPath = src.replace(
              /(build\/)?i18n\/(\w*)\/(\w+_\w+).json/g,
              '$3/$2_locale.js'
            );
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
    generateSharedConstants: 'bundle exec ./script/generateSharedConstants.rb'
  };

  var junitReporterBaseConfig = {
    outputDir: envConstants.CIRCLECI
      ? `${envConstants.CIRCLE_TEST_REPORTS}/apps`
      : ''
  };

  config.karma = {
    options: {
      configFile: 'karma.conf.js',
      singleRun: !envConstants.WATCH,
      files: [
        {
          pattern: 'test/audio/**/*',
          watched: false,
          included: false,
          nocache: true
        },
        {
          pattern: 'test/integration/**/*',
          watched: false,
          included: false,
          nocache: true
        },
        {
          pattern: 'test/scratch/**/*',
          watched: false,
          included: false,
          nocache: true
        },
        {
          pattern: 'test/storybook/**/*',
          watched: false,
          included: false,
          nocache: true
        },
        {
          pattern: 'test/unit/**/*',
          watched: false,
          included: false,
          nocache: true
        },
        {
          pattern: 'test/util/**/*',
          watched: false,
          included: false,
          nocache: true
        },
        {pattern: 'lib/**/*', watched: false, included: false, nocache: true},
        {pattern: 'build/**/*', watched: false, included: false, nocache: true},
        {pattern: 'static/**/*', watched: false, included: false, nocache: true}
      ],
      client: {
        mocha: {
          timeout: 14000,
          grep: grunt.option('grep')
        }
      }
    },
    unit: {
      coverageReporter: {
        dir: 'coverage/unit',
        reporters: [{type: 'html'}, {type: 'lcovonly'}]
      },
      junitReporter: Object.assign({}, junitReporterBaseConfig, {
        outputFile: 'unit.xml'
      }),
      files: [{src: ['test/unit-tests.js'], watched: false}]
    },
    integration: {
      coverageReporter: {
        dir: 'coverage/integration',
        reporters: [{type: 'html'}, {type: 'lcovonly'}]
      },
      junitReporter: Object.assign({}, junitReporterBaseConfig, {
        outputFile: 'integration.xml'
      }),
      files: [{src: ['test/integration-tests.js'], watched: false}]
    },
    scratch: {
      coverageReporter: {
        dir: 'coverage/scratch',
        reporters: [{type: 'html'}, {type: 'lcovonly'}]
      },
      junitReporter: Object.assign({}, junitReporterBaseConfig, {
        outputFile: 'scratch.xml'
      }),
      files: [{src: ['test/scratch-tests.js'], watched: false}]
    },
    storybook: {
      coverageReporter: {
        dir: 'coverage/storybook',
        reporters: [{type: 'html'}, {type: 'lcovonly'}]
      },
      junitReporter: Object.assign({}, junitReporterBaseConfig, {
        outputFile: 'storybook.xml'
      }),
      files: [{src: ['test/storybook-tests.js'], watched: false}]
    },
    entry: {
      coverageReporter: {
        dir: 'coverage/entry',
        reporters: [{type: 'html'}, {type: 'lcovonly'}]
      },
      files: [{src: ['test/entry-tests.js'], watched: false}],
      preprocessors: {
        'test/entry-tests.js': ['webpack', 'sourcemap']
      }
    }
  };

  var appsEntries = _.fromPairs(
    appsToBuild.map(function(app) {
      return [app, './src/sites/studio/pages/levels-' + app + '-main.js'];
    })
  );

  var codeStudioEntries = {
    blockly: './src/sites/studio/pages/blockly.js',
    'code-studio': './src/sites/studio/pages/code-studio.js',
    'levels/contract_match':
      './src/sites/studio/pages/levels/contract_match.jsx',
    'levels/_curriculum_reference':
      './src/sites/studio/pages/levels/_curriculum_reference.js',
    'levels/_dialog': './src/sites/studio/pages/levels/_dialog.js',
    'levels/_standalone_video':
      './src/sites/studio/pages/levels/_standalone_video.js',
    'levels/external': './src/sites/studio/pages/levels/external.js',
    'levels/_level_group': './src/sites/studio/pages/levels/_level_group.js',
    'levels/_match': './src/sites/studio/pages/levels/_match.js',
    'levels/multi': './src/sites/studio/pages/levels/multi.js',
    'levels/textMatch': './src/sites/studio/pages/levels/textMatch.js',
    'levels/widget': './src/sites/studio/pages/levels/widget.js',
    'levels/_external_link':
      './src/sites/studio/pages/levels/_external_link.js',
    'levels/show': './src/sites/studio/pages/levels/show.js',
    'projects/index': './src/sites/studio/pages/projects/index.js',
    'projects/public': './src/sites/studio/pages/projects/public.js',
    'projects/featured': './src/sites/studio/pages/projects/featured.js',
    schoolInfo: './src/sites/studio/pages/schoolInfo.js',
    schoolInfoInterstitial:
      './src/sites/studio/pages/schoolInfoInterstitial.js',
    'scripts/stage_extras': './src/sites/studio/pages/scripts/stage_extras.js',
    signup: './src/sites/studio/pages/signup.js',
    raceInterstitial: './src/sites/studio/pages/raceInterstitial.js',
    'layouts/_terms_interstitial':
      './src/sites/studio/pages/layouts/_terms_interstitial.js',
    'maker/home': './src/sites/studio/pages/maker/home.js',
    'maker/setup': './src/sites/studio/pages/maker/setup.js',
    'maker/discountcode': './src/sites/studio/pages/maker/discountcode.js',
    scriptOverview: './src/sites/studio/pages/scriptOverview.js',
    'home/_homepage': './src/sites/studio/pages/home/_homepage.js',
    'congrats/index': './src/sites/studio/pages/congrats/index.js',
    'courses/index': './src/sites/studio/pages/courses/index.js',
    'courses/show': './src/sites/studio/pages/courses/show.js',
    'devise/registrations/edit':
      './src/sites/studio/pages/devise/registrations/edit.js',
    'devise/registrations/_finish_sign_up':
      './src/sites/studio/pages/devise/registrations/_finish_sign_up.js',
    'teacher_dashboard/show':
      './src/sites/studio/pages/teacher_dashboard/show.js'
  };

  var internalEntries = {
    'blocks/edit': './src/sites/studio/pages/blocks/edit.js',
    'blocks/index': './src/sites/studio/pages/blocks/index.js',
    'courses/edit': './src/sites/studio/pages/courses/edit.js',
    levelbuilder: './src/sites/studio/pages/levelbuilder.js',
    levelbuilder_applab: './src/sites/studio/pages/levelbuilder_applab.js',
    levelbuilder_craft: './src/sites/studio/pages/levelbuilder_craft.js',
    levelbuilder_edit_script:
      './src/sites/studio/pages/levelbuilder_edit_script.js',
    levelbuilder_gamelab: './src/sites/studio/pages/levelbuilder_gamelab.js',
    levelbuilder_pixelation:
      './src/sites/studio/pages/levelbuilder_pixelation.js',
    levelbuilder_studio: './src/sites/studio/pages/levelbuilder_studio.js',
    'levels/editors/_all': './src/sites/studio/pages/levels/editors/_all.js',
    'levels/editors/_blockly':
      './src/sites/studio/pages/levels/editors/_blockly.js',
    'levels/editors/_droplet':
      './src/sites/studio/pages/levels/editors/_droplet.js',
    'levels/editors/_dsl': './src/sites/studio/pages/levels/editors/_dsl.js',
    'libraries/edit': './src/sites/studio/pages/libraries/edit.js',
    'shared_blockly_functions/edit':
      './src/sites/studio/pages/shared_blockly_functions/edit.js'
  };

  var pegasusEntries = {
    // code.org
    'code.org/public/dance': './src/sites/code.org/pages/public/dance.js',
    'code.org/public/educate/curriculum/courses':
      './src/sites/code.org/pages/public/educate/curriculum/courses.js',
    'code.org/public/educate/regional-partner/playbook':
      './src/sites/code.org/pages/public/educate/regional-partner/playbook.js',
    'code.org/public/student/middle-high':
      './src/sites/code.org/pages/public/student/middle-high.js',
    'code.org/public/teacher-dashboard/index':
      './src/sites/code.org/pages/public/teacher-dashboard/index.js',
    'code.org/public/yourschool':
      './src/sites/code.org/pages/public/yourschool.js',
    'code.org/public/yourschool/thankyou':
      './src/sites/code.org/pages/public/yourschool/thankyou.js',
    'code.org/views/theme_common_head_after':
      './src/sites/code.org/pages/views/theme_common_head_after.js',
    'code.org/views/workshop_search':
      './src/sites/code.org/pages/views/workshop_search.js',

    // hourofcode.com
    'hourofcode.com/public/index':
      './src/sites/hourofcode.com/pages/public/index.js',
    'hourofcode.com/views/theme_common_head_after':
      './src/sites/hourofcode.com/pages/views/theme_common_head_after.js'
  };

  var professionalDevelopmentEntries = {
    'code.org/public/pd-workshop-survey/splat':
      './src/sites/code.org/pages/public/pd-workshop-survey/splat.js',

    'pd/workshop_dashboard/index':
      './src/sites/studio/pages/pd/workshop_dashboard/index.js',
    'pd/facilitator_program_registration/new':
      './src/sites/studio/pages/pd/facilitator_program_registration/new.js',
    'pd/regional_partner_program_registration/new':
      './src/sites/studio/pages/pd/regional_partner_program_registration/new.js',
    'pd/workshop_survey/new':
      './src/sites/studio/pages/pd/workshop_survey/new.js',
    'pd/pre_workshop_survey/new':
      './src/sites/studio/pages/pd/pre_workshop_survey/new.js',
    'pd/teachercon_survey/new':
      './src/sites/studio/pages/pd/teachercon_survey/new.js',
    'pd/application_dashboard/index':
      './src/sites/studio/pages/pd/application_dashboard/index.js',
    'pd/application/facilitator_application/new':
      './src/sites/studio/pages/pd/application/facilitator_application/new.js',
    'pd/application/teacher_application/new':
      './src/sites/studio/pages/pd/application/teacher_application/new.js',
    'pd/application/principal_approval_application/new':
      './src/sites/studio/pages/pd/application/principal_approval_application/new.js',
    'pd/fit_weekend_registration/new':
      './src/sites/studio/pages/pd/fit_weekend_registration/new.js',
    'pd/workshop_enrollment/new':
      './src/sites/studio/pages/pd/workshop_enrollment/new.js',
    'pd/workshop_enrollment/cancel':
      './src/sites/studio/pages/pd/workshop_enrollment/cancel.js',

    'pd/professional_learning_landing/index':
      './src/sites/studio/pages/pd/professional_learning_landing/index.js',
    'pd/regional_partner_contact/new':
      './src/sites/studio/pages/pd/regional_partner_contact/new.js',
    'pd/regional_partner_mini_contact/new':
      './src/sites/studio/pages/pd/regional_partner_mini_contact/new.js',

    'pd/international_opt_in/new':
      './src/sites/studio/pages/pd/international_opt_in/new.js'
  };

  var otherEntries = {
    essential: './src/sites/studio/pages/essential.js',
    plc: './src/sites/studio/pages/plc.js',

    // Build embedVideo.js in its own step (skipping factor-bundle) so that
    // we don't have to include the large code-studio-common file in the
    // embedded video page, keeping it fairly lightweight.
    // (I wonder how much more we could slim it down by removing jQuery!)
    // @see embed.html.haml
    embedVideo: './src/sites/studio/pages/embedVideo.js',

    // embedBlocks.js is just React, the babel-polyfill, and a few other dependencies
    // in a bundle to minimize the amount of stuff we need when loading blocks
    // in an iframe.
    embedBlocks: './src/sites/studio/pages/embedBlocks.js',

    // tutorialExplorer for code.org/learn 2016 edition.
    tutorialExplorer: './src/tutorialExplorer/tutorialExplorer.js',

    'peer_reviews/dashboard':
      './src/sites/studio/pages/peer_reviews/dashboard.js',

    publicKeyCryptography: './src/publicKeyCryptography/main.js',

    brambleHost: './src/weblab/brambleHost.js',

    'applab-api': './src/applab/api-entry.js',
    'gamelab-api': './src/gamelab/api-entry.js',

    'shared/_check_admin': './src/sites/studio/pages/shared/_check_admin.js',

    'census_reviewers/review_reported_inaccuracies':
      './src/sites/studio/pages/census_reviewers/review_reported_inaccuracies.js',

    regionalPartnerSearch: './src/regionalPartnerSearch/regionalPartnerSearch',

    regionalPartnerMiniContact:
      './src/regionalPartnerMiniContact/regionalPartnerMiniContact',

    cookieBanner: './src/cookieBanner/cookieBanner.js'
  };

  // Create a config for each of our bundles
  function createConfig(options) {
    var minify = options.minify;
    var watch = options.watch;

    return webpackConfig.create({
      output: path.resolve(__dirname, OUTPUT_DIR),
      entries: _.mapValues(
        _.extend(
          {},
          appsEntries,
          codeStudioEntries,
          internalEntries,
          pegasusEntries,
          professionalDevelopmentEntries,
          otherEntries
        ),
        function(val) {
          return [
            './src/util/idempotent-babel-polyfill',
            'whatwg-fetch'
          ].concat(val);
        }
      ),
      externals: [
        {
          jquery: 'var $',
          // qtip2 doesn't actually export anything - it's a jquery extension
          // and modifies the jquery object when present.
          // We also want to be free to import 'qtip2' in our code (for tests)
          // without including a copy of it in our release bundles since it's
          // already provided by application.js.
          // Therefore we include it as an external here (which keeps us from
          // including the library in release bundles) but we map it to the
          // jquery object, which will always be available when we are depending
          // on qtip.  Tests skip this 'external' configuration and load the
          // npm-provided copy of qtip2.
          qtip2: 'var $'
        }
      ],
      mode: minify ? 'production' : 'development',
      optimization: {
        minimizer: [
          compiler => {
            const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
            const plugin = new UglifyJsPlugin({
              cache: true,
              parallel: true,
              sourceMap: envConstants.DEBUG_MINIFIED
            });
            plugin.apply(compiler);
          }
        ],

        // We use a single, named runtimeChunk in order to be able to load
        // multiple webpack entry points on a single page. **The resulting
        // 'webpack-runtime' chunk must be included exactly once on each page
        // which includes webpack entry points.** If you do not include the
        // runtime, webpack entry points you include will not be loaded. If you
        // include the runtime twice, webpack entry points will be loaded twice.
        //
        // Without a single, named runtimeChunk there would be no runtimeChunk
        // to include, and entry point would load and run separately.
        // However, those entry points would create separate instances of any
        // shared modules. This would mean that state within webpack modules
        // cannot be shared between entry points, breaking many assumptions made
        // by our application. For more information, see:
        // https://webpack.js.org/concepts/manifest/#runtime
        // https://webpack.js.org/configuration/optimization/#optimizationruntimechunk
        //
        // In the future, if we can limit ourselves to one webpack entry point
        // per page, we could consider removing the runtimeChunk config.
        runtimeChunk: {
          name: 'webpack-runtime'
        },
        splitChunks: {
          cacheGroups: {
            // Pull any module shared by 2+ appsEntries into the "common" chunk.
            common: {
              name: 'common',
              minChunks: 2,
              chunks: chunk => {
                return _.keys(appsEntries).includes(chunk.name);
              }
            },
            // Pull any module shared by 2+ codeStudioEntries into the
            // "code-studio-common" chunk.
            'code-studio-common': {
              name: 'code-studio-common',
              minChunks: 2,
              chunks: chunk => {
                const chunkNames = _.keys(codeStudioEntries);
                return chunkNames.includes(chunk.name);
              },
              priority: 10
            },
            // With just the cacheGroups listed above, we end up with many
            // duplicate modules between the "common" and "code-studio-common"
            // chunks. The next cache group eliminates some of this duplication
            // by pulling more modules from "common" into "code-studio-common".
            //
            // The cacheGroup below opportunistically pulls modules from
            // "common" into "code-studio-common". The key is that it uses
            // minChunks to prevent any modules used only by appsEntries from
            // being extracted, providing a guarantee that we don't
            // unnecessarily increase the download size for pages which include
            // code-studio-common.js but not common.js.
            //
            // There is no converse guarantee that this strategy will eliminate
            // all duplication between "common" and "code-studio-common".
            // However, at the time of this writing, bundle analysis indicates
            // that is currently effective in eliminating any duplication.
            //
            // In the future, we want to move toward asynchronous imports, which
            // allow webpack to manage bundle splitting and sharing behind the
            // scene. Once we adopt this approach, the need for predefined
            // cacheGroups will go away.
            //
            // For more information see: https://webpack.js.org/guides/code-splitting/
            'code-studio-multi': {
              name: 'code-studio-common',
              minChunks: _.keys(appsEntries).length + 1,
              chunks: chunk => {
                const chunkNames = _.keys(codeStudioEntries).concat(
                  _.keys(appsEntries)
                );
                return chunkNames.includes(chunk.name);
              },
              priority: 20
            }
          }
        }
      },
      plugins: [
        ...(process.env.ANALYZE_BUNDLE
          ? [
              new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                excludeAssets: [...Object.keys(internalEntries)]
              })
            ]
          : []),
        new StatsWriterPlugin({
          fields: ['assetsByChunkName', 'assets']
        }),
        // Needed because our production environment relies on an unminified
        // (but digested) version of certain files such as blockly.js.
        new UnminifiedWebpackPlugin()
      ],
      minify: minify,
      watch: watch,
      watchNotify: grunt.option('watch-notify'),
      piskelDevMode: PISKEL_DEVELOPMENT_MODE
    });
  }

  config.webpack = {
    build: createConfig({
      minify: false,
      watch: false
    }),

    uglify: createConfig({
      minify: true,
      watch: false
    }),

    watch: createConfig({
      minify: false,
      watch: true
    })
  };

  config['webpack-dev-server'] = {
    watch: {
      webpack: createConfig({
        minify: false,
        watch: false
      }),
      keepAlive: true,
      proxy: {
        '**': 'http://localhost:3000'
      },
      publicPath: '/assets/js/',
      hot: true,
      inline: true,
      port: 3001,
      host: '0.0.0.0',
      watchOptions: {
        aggregateTimeout: 1000,
        poll: 1000,
        ignored: /^node_modules\/[^@].*/
      }
    }
  };

  config.uglify = {
    lib: {
      files: _.fromPairs(
        ['p5play/p5.play.js', 'p5play/p5.js'].map(function(src) {
          return [
            OUTPUT_DIR + src.replace(/\.js$/, '.min.js'), // dst
            OUTPUT_DIR + src // src
          ];
        })
      )
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
      tasks: ['newer:copy:lib', 'notify:vendor_js'],
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
    }
  };

  (config.concurrent = {
    // run our two watch tasks concurrently so that they dont block each other
    watch: {
      tasks: [
        'watch',
        envConstants.HOT ? 'webpack-dev-server:watch' : 'webpack:watch'
      ],
      options: {
        logConcurrentOutput: true
      }
    }
  }),
    (config.notify = {
      'js-build': {options: {message: 'JS build completed.'}},
      sass: {options: {message: 'SASS build completed.'}},
      content: {options: {message: 'Content build completed.'}},
      ejs: {options: {message: 'EJS build completed.'}},
      messages: {options: {message: 'i18n messages build completed.'}},
      vendor_js: {options: {message: 'vendor JS copy done.'}}
    });

  grunt.initConfig(config);

  // Autoload grunt tasks
  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', '!grunt-lib-contrib']
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('noop', function() {});

  // Generate locale stub files in the build/locale/current folder
  grunt.registerTask('locales', function() {
    var current = path.resolve('build/locale/current');
    child_process.execSync('mkdir -p ' + current);
    appsToBuild
      .concat(
        'common',
        'tutorialExplorer',
        'regionalPartnerSearch',
        'regionalPartnerMiniContact'
      )
      .map(function(item) {
        var localeType = item === 'common' ? 'locale' : 'appLocale';
        var localeString =
          '/*' +
          item +
          '*/ ' +
          'module.exports = window.blockly.' +
          localeType +
          ';';
        fs.writeFileSync(path.join(current, item + '.js'), localeString);
      });
  });

  // Checks the size of Droplet to ensure it's built with LANGUAGE=javascript
  grunt.registerTask('checkDropletSize', function() {
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
    'newer:messages',
    'exec:convertScssVars',
    'exec:generateSharedConstants',
    'newer:copy:src',
    'newer:copy:lib',
    'locales',
    'ejs'
  ]);

  grunt.registerTask('check-entry-points', function() {
    const done = this.async();
    checkEntryPoints(config.webpack.build, {verbose: true}).then(stats =>
      done()
    );
  });

  grunt.registerTask('lint-entry-points', function() {
    const done = this.async();
    checkEntryPoints(config.webpack.build).then(stats => {
      console.log(
        [
          chalk.green(`[${stats.passed} passed]`),
          stats.silenced && chalk.yellow(`[${stats.silenced} silenced]`),
          stats.failed && chalk.red(`[${stats.failed} failed]`)
        ]
          .filter(f => f)
          .join(' ')
      );
      if (stats.failed > 0) {
        grunt.warn(
          `${
            stats.failed
          } entry points do not conform to naming conventions.\n` +
            `Run grunt check-entry-points for details.\n`
        );
      }
      done();
    });
  });

  grunt.registerTask('compile-firebase-rules', function() {
    if (process.env.RACK_ENV === 'production') {
      throw new Error(
        'Cannot compile firebase security rules on production.\n' +
          'Instead, upload security rules from the apps package which was downloaded from s3.'
      );
    }
    child_process.execSync('mkdir -p ./build/package/firebase');
    child_process.execSync(
      '`npm bin`/firebase-bolt < ./firebase/rules.bolt > ./build/package/firebase/rules.json'
    );
  });

  grunt.registerTask('postbuild', [
    'newer:copy:static',
    'newer:sass',
    'compile-firebase-rules'
  ]);

  grunt.registerTask('build', [
    'prebuild',
    envConstants.DEV ? 'webpack:build' : 'webpack:uglify',
    'notify:js-build',
    // Skip minification in development environment.
    envConstants.DEV ? 'noop' : 'uglify:lib',
    'postbuild'
  ]);

  grunt.registerTask('rebuild', ['clean', 'build']);

  grunt.registerTask('preconcat', [
    'newer:messages',
    'exec:convertScssVars',
    'exec:generateSharedConstants',
    'newer:copy:static'
  ]);

  grunt.registerTask('dev', [
    'prebuild',
    'newer:sass',
    'concurrent:watch',
    'postbuild'
  ]);

  grunt.registerTask('unitTest', [
    'newer:messages',
    'exec:convertScssVars',
    'exec:generateSharedConstants',
    'karma:unit'
  ]);

  grunt.registerTask('storybookTest', ['karma:storybook']);

  grunt.registerTask('integrationTest', ['preconcat', 'karma:integration']);

  // Run Scratch tests in a separate target so `window.Blockly` doesn't collide.
  grunt.registerTask('scratchTest', ['preconcat', 'karma:scratch']);

  grunt.registerTask('logBuildTimes', function() {
    var done = this.async();
    buildTimeLogger.upload(console.log, done);
  });

  grunt.registerTask('default', ['rebuild', 'test']);
};
