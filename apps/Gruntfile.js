var chalk = require('chalk');
var child_process = require('child_process');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var webpackConfig = require('./webpack');
var envConstants = require('./envConstants');
var checkEntryPoints = require('./script/checkEntryPoints');
var {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
var CopyPlugin = require('copy-webpack-plugin');
var {StatsWriterPlugin} = require('webpack-stats-plugin');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
var sass = require('node-sass');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');

module.exports = function(grunt) {
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
import '@babel/polyfill';
import 'whatwg-fetch';
import Adapter from 'enzyme-adapter-react-15.4';
import enzyme from 'enzyme';
enzyme.configure({adapter: new Adapter()});
import { throwOnConsoleErrorsEverywhere, throwOnConsoleWarningsEverywhere } from './util/throwOnConsole';
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
    'fish',
    'flappy',
    'gamelab',
    'spritelab',
    'jigsaw',
    'maze',
    'netsim',
    'studio',
    'turtle',
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
          cwd: 'node_modules/@code-dot-org/ml-activities/dist/assets',
          src: ['**'],
          dest: 'build/package/media/skins/fish'
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
          dest: 'build/package/video-js'
        }
      ]
    },
    lib: {
      files: [
        {
          expand: true,
          cwd: 'lib/blockly',
          src: ['*_*.js'],
          dest: 'build/locales',
          // e.g., ar_sa.js -> ar_sa/blockly_locale.js
          rename: function(dest, src) {
            var outputPath = src.replace(
              /(.+_.+)\.js/g,
              '$1/blockly_locale.js'
            );
            return path.join(dest, outputPath);
          }
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
          dest: 'build/package/js/ace/'
        },
        // Pull p5.js and p5.play.js into the package from our forks. These are
        // needed by the gamelab exporter code in production and development.
        {
          expand: true,
          cwd: './node_modules/@code-dot-org/p5/lib',
          src: ['p5.js'],
          dest: 'build/package/js/p5play/'
        },
        {
          expand: true,
          cwd: './node_modules/@code-dot-org/p5.play/lib',
          src: ['p5.play.js'],
          dest: 'build/package/js/p5play/'
        },
        // Piskel must not be minified or digested in order to work properly.
        {
          expand: true,
          // For some reason, if we provide piskel root as an absolute path here,
          // our dest ends up with an empty set of directories matching the path
          // If we provide it as a relative path, that does not happen
          cwd: './' + path.relative(process.cwd(), piskelRoot),
          src: ['**'],
          dest: 'build/package/js/piskel/'
        },
        // Bramble must not be minified or digested in order to work properly.
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
          dest: 'build/minifiable-lib/droplet/'
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
          dest: 'build/minifiable-lib/tooltipster/'
        },
        {
          expand: true,
          cwd: 'lib/phaser',
          src: ['*.js'],
          dest: 'build/minifiable-lib/phaser/'
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
          dest: 'build/minifiable-lib/fileupload/'
        }
      ]
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
            'gamelab-apiwp*.min.js'
          ],
          dest: 'build/package/js',
          // e.g. webpack-runtimewp0123456789aabbccddee.min.js --> webpack-runtime.min.js
          rename: function(dest, src) {
            var outputFile = src.replace(/wp[0-9a-f]{20}/, '');
            return path.join(dest, outputFile);
          }
        }
      ]
    }
  };

  config.sass = {
    all: {
      options: {
        // Compression currently occurs at the ../dashboard sprockets layer.
        outputStyle: 'nested',
        includePaths: ['node_modules', '../shared/css/'],
        implementation: sass
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
          ],
          ['build/package/css/foorm.css', 'style/code-studio/foorm.scss']
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
      options: {
        dest: 'build/locales'
      },
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
          dest: 'build/locales'
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
      coverageIstanbulReporter: {
        dir: 'coverage/unit'
      },
      junitReporter: Object.assign({}, junitReporterBaseConfig, {
        outputFile: 'unit.xml'
      }),
      files: [{src: ['test/unit-tests.js'], watched: false}]
    },
    integration: {
      coverageIstanbulReporter: {
        dir: 'coverage/integration'
      },
      junitReporter: Object.assign({}, junitReporterBaseConfig, {
        outputFile: 'integration.xml'
      }),
      files: [{src: ['test/integration-tests.js'], watched: false}]
    },
    storybook: {
      coverageIstanbulReporter: {
        dir: 'coverage/storybook'
      },
      junitReporter: Object.assign({}, junitReporterBaseConfig, {
        outputFile: 'storybook.xml'
      }),
      files: [{src: ['test/storybook-tests.js'], watched: false}]
    },
    entry: {
      coverageIstanbulReporter: {
        dir: 'coverage/entry'
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
    'code-studio': './src/sites/studio/pages/code-studio.js',
    'congrats/index': './src/sites/studio/pages/congrats/index.js',
    'courses/index': './src/sites/studio/pages/courses/index.js',
    'courses/show': './src/sites/studio/pages/courses/show.js',
    'devise/registrations/_finish_sign_up':
      './src/sites/studio/pages/devise/registrations/_finish_sign_up.js',
    'devise/registrations/edit':
      './src/sites/studio/pages/devise/registrations/edit.js',
    essential: './src/sites/studio/pages/essential.js',
    'home/_homepage': './src/sites/studio/pages/home/_homepage.js',
    'layouts/_parent_email_banner':
      './src/sites/studio/pages/layouts/_parent_email_banner.js',
    'layouts/_race_interstitial':
      './src/sites/studio/pages/layouts/_race_interstitial.js',
    'layouts/_school_info_confirmation_dialog':
      './src/sites/studio/pages/layouts/_school_info_confirmation_dialog.js',
    'layouts/_school_info_interstitial':
      './src/sites/studio/pages/layouts/_school_info_interstitial.js',
    'layouts/_small_footer':
      './src/sites/studio/pages/layouts/_small_footer.js',
    'layouts/_terms_interstitial':
      './src/sites/studio/pages/layouts/_terms_interstitial.js',
    'layouts/_thank_donors_interstitial':
      './src/sites/studio/pages/layouts/_thank_donors_interstitial.js',
    'levels/_bubble_choice':
      './src/sites/studio/pages/levels/_bubble_choice.js',
    'levels/_content': './src/sites/studio/pages/levels/_content.js',
    'levels/_contract_match':
      './src/sites/studio/pages/levels/_contract_match.js',
    'levels/_curriculum_reference':
      './src/sites/studio/pages/levels/_curriculum_reference.js',
    'levels/_dialog': './src/sites/studio/pages/levels/_dialog.js',
    'levels/_evaluation_multi':
      './src/sites/studio/pages/levels/_evaluation_multi.js',
    'levels/_external': './src/sites/studio/pages/levels/_external.js',
    'levels/_external_link':
      './src/sites/studio/pages/levels/_external_link.js',
    'levels/_free_response':
      './src/sites/studio/pages/levels/_free_response.js',
    'levels/_level_group': './src/sites/studio/pages/levels/_level_group.js',
    'levels/_match': './src/sites/studio/pages/levels/_match.js',
    'levels/_multi': './src/sites/studio/pages/levels/_multi.js',
    'levels/_standalone_video':
      './src/sites/studio/pages/levels/_standalone_video.js',
    'levels/_teacher_markdown':
      './src/sites/studio/pages/levels/_teacher_markdown.js',
    'levels/_teacher_panel':
      './src/sites/studio/pages/levels/_teacher_panel.js',
    'levels/_text_match': './src/sites/studio/pages/levels/_text_match.js',
    'levels/_widget': './src/sites/studio/pages/levels/_widget.js',
    'levels/show': './src/sites/studio/pages/levels/show.js',
    'maker/discountcode': './src/sites/studio/pages/maker/discountcode.js',
    'maker/home': './src/sites/studio/pages/maker/home.js',
    'maker/setup': './src/sites/studio/pages/maker/setup.js',
    'projects/featured': './src/sites/studio/pages/projects/featured.js',
    'projects/index': './src/sites/studio/pages/projects/index.js',
    'report_abuse/report_abuse_form':
      './src/sites/studio/pages/report_abuse/report_abuse_form.js',
    'scripts/show': './src/sites/studio/pages/scripts/show.js',
    'scripts/stage_extras': './src/sites/studio/pages/scripts/stage_extras.js',
    'sections/show': './src/sites/studio/pages/sections/show.js',
    'shared/_school_info': './src/sites/studio/pages/shared/_school_info.js',
    'teacher_dashboard/show':
      './src/sites/studio/pages/teacher_dashboard/show.js',
    'teacher_dashboard/parent_letter':
      './src/sites/studio/pages/teacher_dashboard/parent_letter.js',
    'teacher_feedbacks/index':
      './src/sites/studio/pages/teacher_feedbacks/index.js'
  };

  var internalEntries = {
    'admin_standards/index':
      './src/sites/studio/pages/admin_standards/index.js',
    'blocks/edit': './src/sites/studio/pages/blocks/edit.js',
    'blocks/index': './src/sites/studio/pages/blocks/index.js',
    'courses/edit': './src/sites/studio/pages/courses/edit.js',
    'datasets/show': './src/sites/studio/pages/datasets/show.js',
    'datasets/index': './src/sites/studio/pages/datasets/index.js',
    'datasets/edit_manifest':
      './src/sites/studio/pages/datasets/edit_manifest.js',
    'lessons/edit': './src/sites/studio/pages/lessons/edit.js',
    'lessons/show': './src/sites/studio/pages/lessons/show.js',
    levelbuilder: './src/sites/studio/pages/levelbuilder.js',
    'levels/editors/_applab':
      './src/sites/studio/pages/levels/editors/_applab.js',
    'levels/editors/_craft':
      './src/sites/studio/pages/levels/editors/_craft.js',
    'levels/editors/_dsl': './src/sites/studio/pages/levels/editors/_dsl.js',
    'levels/editors/fields/_blockly':
      './src/sites/studio/pages/levels/editors/fields/_blockly.js',
    'levels/editors/fields/_callouts':
      './src/sites/studio/pages/levels/editors/fields/_callouts.js',
    'levels/editors/fields/_droplet':
      './src/sites/studio/pages/levels/editors/fields/_droplet.js',
    'levels/editors/fields/_grid':
      './src/sites/studio/pages/levels/editors/fields/_grid.js',
    'levels/editors/fields/_preload_assets':
      './src/sites/studio/pages/levels/editors/fields/_preload_assets.js',
    'levels/editors/fields/_special_level_types':
      './src/sites/studio/pages/levels/editors/fields/_special_level_types.js',
    'levels/editors/fields/_video':
      './src/sites/studio/pages/levels/editors/fields/_video.js',
    'levels/editors/_gamelab':
      './src/sites/studio/pages/levels/editors/_gamelab.js',
    'levels/editors/_pixelation':
      './src/sites/studio/pages/levels/editors/_pixelation.js',
    'levels/editors/_studio':
      './src/sites/studio/pages/levels/editors/_studio.js',
    'libraries/edit': './src/sites/studio/pages/libraries/edit.js',
    'scripts/edit': './src/sites/studio/pages/scripts/edit.js',
    'scripts/new': './src/sites/studio/pages/scripts/new.js',
    'shared/_check_admin': './src/sites/studio/pages/shared/_check_admin.js',
    'shared_blockly_functions/edit':
      './src/sites/studio/pages/shared_blockly_functions/edit.js'
  };

  var pegasusEntries = {
    // code.org
    'code.org/public/administrators':
      './src/sites/code.org/pages/public/administrators.js',
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
    'code.org/views/regional_partner_search':
      './src/sites/code.org/pages/views/regional_partner_search.js',
    'code.org/views/share_privacy':
      './src/sites/code.org/pages/views/share_privacy.js',
    'code.org/views/theme_common_head_after':
      './src/sites/code.org/pages/views/theme_common_head_after.js',
    'code.org/views/workshop_search':
      './src/sites/code.org/pages/views/workshop_search.js',
    'code.org/views/amazon_future_engineer':
      './src/sites/code.org/pages/views/amazon_future_engineer.js',
    'code.org/views/amazon_future_engineer_eligibility':
      './src/sites/code.org/pages/views/amazon_future_engineer_eligibility.js',

    // hourofcode.com
    'hourofcode.com/public/index':
      './src/sites/hourofcode.com/pages/public/index.js',
    'hourofcode.com/views/theme_common_head_after':
      './src/sites/hourofcode.com/pages/views/theme_common_head_after.js',
    'hourofcode.com/views/hoc_events_map':
      './src/sites/hourofcode.com/pages/views/hoc_events_map.js',

    // shared between code.org and hourofcode.com
    tutorialExplorer: './src/tutorialExplorer/tutorialExplorer.js'
  };

  var professionalDevelopmentEntries = {
    'code.org/public/pd-workshop-survey/splat':
      './src/sites/code.org/pages/public/pd-workshop-survey/splat.js',
    'code.org/public/learn/local':
      './src/sites/code.org/pages/public/learn/local.js',
    'code.org/views/professional_learning_apply_banner':
      './src/sites/code.org/pages/views/professional_learning_apply_banner.js',
    'code.org/views/at_home_banner':
      './src/sites/code.org/pages/views/at_home_banner.js',

    'pd/_jotform_loader': './src/sites/studio/pages/pd/_jotform_loader.js',
    'pd/_jotform_embed': './src/sites/studio/pages/pd/_jotform_embed.js',

    'pd/workshop_dashboard/index':
      './src/sites/studio/pages/pd/workshop_dashboard/index.js',
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
    'pd/workshop_daily_survey/new_general_foorm':
      './src/sites/studio/pages/pd/workshop_daily_survey/new_general_foorm.js',
    'pd/workshop_enrollment/new':
      './src/sites/studio/pages/pd/workshop_enrollment/new.js',
    'pd/workshop_enrollment/cancel':
      './src/sites/studio/pages/pd/workshop_enrollment/cancel.js',

    'pd/professional_learning_landing/index':
      './src/sites/studio/pages/pd/professional_learning_landing/index.js',
    'pd/regional_partner_mini_contact/new':
      './src/sites/studio/pages/pd/regional_partner_mini_contact/new.js',

    'pd/international_opt_in/new':
      './src/sites/studio/pages/pd/international_opt_in/new.js',

    'peer_reviews/dashboard':
      './src/sites/studio/pages/peer_reviews/dashboard.js',
    'peer_reviews/show': './src/sites/studio/pages/peer_reviews/show.js',

    'foorm/preview/index': './src/sites/studio/pages/foorm/preview/index.js',
    'foorm/preview/name': './src/sites/studio/pages/foorm/preview/name.js',
    'foorm/editor/index': './src/sites/studio/pages/foorm/editor/index.js',
    'foorm/misc_survey/new': './src/sites/studio/pages/foorm/misc_survey/new.js'
  };

  // Entries which are shared between dashboard and pegasus, which are included
  // by haml partials in the shared/haml/ directory.
  const sharedEntries = {
    cookieBanner: './src/cookieBanner/cookieBanner.js'
  };

  var otherEntries = {
    // The blockly dependency is huge, so we currently control when it is
    // loaded explicitly via script tags rather than via normal imports.
    blockly: './src/sites/studio/pages/blockly.js',

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

    publicKeyCryptography: './src/publicKeyCryptography/main.js',

    brambleHost: './src/weblab/brambleHost.js',

    'applab-api': './src/applab/api-entry.js',
    'gamelab-api': './src/p5lab/gamelab/api-entry.js',

    'census_reviewers/review_reported_inaccuracies':
      './src/sites/studio/pages/census_reviewers/review_reported_inaccuracies.js',

    regionalPartnerMiniContact:
      './src/regionalPartnerMiniContact/regionalPartnerMiniContact'
  };

  // Create a config for each of our bundles
  function createConfig(options) {
    var minify = options.minify;
    var watch = options.watch;

    return webpackConfig.create({
      outputDir: path.resolve(__dirname, OUTPUT_DIR),
      entries: _.mapValues(
        _.extend(
          {},
          appsEntries,
          codeStudioEntries,
          internalEntries,
          pegasusEntries,
          professionalDevelopmentEntries,
          sharedEntries,
          otherEntries
        ),
        function(val) {
          return ['@babel/polyfill/noConflict', 'whatwg-fetch'].concat(val);
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
          new UglifyJsPlugin({
            // Excludes these from minification to avoid breaking functionality,
            // but still adds .min to the output filename suffix.
            exclude: [/\/blockly.js$/, /\/brambleHost.js$/],
            cache: true,
            parallel: true,
            sourceMap: envConstants.DEBUG_MINIFIED
          })
        ],

        // We use a single, named runtimeChunk in order to be able to load
        // multiple webpack entry points on a single page. **The resulting
        // 'webpack-runtime' chunk must be included exactly once on each page
        // which includes webpack entry points.** If you do not include the
        // runtime, webpack entry points you include will not be loaded. If you
        // include the runtime twice, webpack entry points will be loaded twice.
        //
        // Without a single, named runtimeChunk there would be no runtimeChunk
        // to include, and entry points would load and run separately.
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
          // Override the default limit of 3 concurrent downloads on page load,
          // which only makes sense for HTTP 1.1 servers. HTTP 2 performance has
          // been observed to degrade only with > 200 simultaneous downloads.
          maxInitialRequests: 100,
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
                const chunkNames = Object.keys(codeStudioEntries);
                return chunkNames.includes(chunk.name);
              },
              priority: 10
            },
            // With just the cacheGroups listed above, we end up with many
            // duplicate modules between the "common" and "code-studio-common"
            // chunks. The next cache group eliminates some of this duplication
            // by pulling more modules from "common" into "code-studio-common".
            //
            // The use of minChunks provides a guarantee that we don't
            // unnecessarily move things into "code-studio-common" which are
            // needed only by appsEntries. This avoids increasing the download
            // size for code studio pages which include code-studio-common.js
            // but not common.js.
            //
            // There is no converse guarantee that this strategy will eliminate
            // all duplication between "common" and "code-studio-common".
            // However, at the time of this writing, bundle analysis indicates
            // that is currently effective in eliminating any duplication.
            //
            // In the future, we want to move toward asynchronous imports, which
            // allow webpack to manage bundle splitting and sharing behind the
            // scenes. Once we adopt this approach, the need for predefined
            // cacheGroups will go away.
            //
            // For more information see: https://webpack.js.org/guides/code-splitting/
            'code-studio-multi': {
              name: 'code-studio-common',
              minChunks: Object.keys(appsEntries).length + 1,
              chunks: chunk => {
                const chunkNames = Object.keys(codeStudioEntries).concat(
                  Object.keys(appsEntries)
                );
                return chunkNames.includes(chunk.name);
              },
              priority: 20
            },
            vendors: {
              name: 'vendors',
              priority: 30,
              chunks: chunk => {
                // all 'initial' chunks except otherEntries
                const chunkNames = _.concat(
                  Object.keys(codeStudioEntries),
                  Object.keys(appsEntries),
                  Object.keys(pegasusEntries),
                  Object.keys(professionalDevelopmentEntries),
                  Object.keys(internalEntries),
                  Object.keys(sharedEntries)
                );
                return chunkNames.includes(chunk.name);
              },
              test(module) {
                return [
                  '@babel/polyfill',
                  'immutable',
                  'lodash',
                  'moment',
                  'pepjs',
                  'radium',
                  'react',
                  'react-dom',
                  'wgxpath'
                ].some(libName =>
                  new RegExp(`/apps/node_modules/${libName}/`).test(
                    module.resource
                  )
                );
              }
            },
            p5lab: {
              name: 'p5-dependencies',
              priority: 10,
              minChunks: 2,
              chunks: chunk =>
                ['spritelab', 'gamelab', 'dance'].includes(chunk.name),
              test: module => /p5/.test(module.resource)
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
        // The [contenthash] placeholder generates a 32-character hash when
        // used within the copy plugin.
        new CopyPlugin(
          [
            // Always include unhashed locale files in the package, since unit
            // tests rely on these in both minified and unminified environments.
            // The order of these rules is important to ensure that the hashed
            // locale files appear in the manifest when minifying.
            {
              from: 'build/locales',
              to: '[path]/[name].[ext]',
              toType: 'template'
            },
            minify && {
              from: 'build/locales',
              to: '[path]/[name]wp[contenthash].[ext]',
              toType: 'template'
            },
            // Libraries in this directory are assumed to have .js and .min.js
            // copies of each source file. In development mode, copy only foo.js.
            // In production mode, copy only foo.min.js and rename it to foo.js.
            // This allows the manifest to contain a single mapping from foo.js
            // to a target file with the correct contents given the mode.
            //
            // Ideally, the target file would have the .min.js suffix in
            // production mode. This could be accomplished by nesting these files
            // within a minifiable-lib directory in the output package so that the
            // manifest plugin could do special processing on these files.
            {
              context: 'build/minifiable-lib/',
              from: minify ? `**/*.min.js` : '**/*.js',
              to: minify
                ? '[path]/[name]wp[contenthash].[ext]'
                : '[path]/[name].[ext]',
              toType: 'template',
              ignore: minify ? [] : ['*.min.js'],
              transformPath: targetPath => targetPath.replace(/\.min/, '')
            }
          ].filter(entry => !!entry)
        ),
        // Unit tests require certain unminified files to have been built.
        new UnminifiedWebpackPlugin({
          include: [/^webpack-runtime/, /^applab-api/, /^gamelab-api/]
        }),
        new ManifestPlugin({
          basePath: 'js/',
          map: file => {
            if (minify) {
              // Remove contenthash in manifest key from files generated via
              // copy-webpack-plugin. See:
              // https://github.com/webpack-contrib/copy-webpack-plugin/issues/104#issuecomment-370174211
              file.name = file.name.replace(/wp[a-f0-9]{32}\./, '.');
            }
            return file;
          }
        })
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
            'build/package/js/' + src.replace(/\.js$/, '.min.js'), // dst
            'build/package/js/' + src // src
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
          'module.exports = window.locales.' +
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
    // For any minifiable libs, generate minified sources if they do not already
    // exist in our repo. Skip minification in development environment.
    envConstants.DEV ? 'noop' : 'uglify:lib',
    envConstants.DEV ? 'webpack:build' : 'webpack:uglify',
    'notify:js-build',
    'postbuild',
    envConstants.DEV ? 'noop' : 'newer:copy:unhash'
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

  grunt.registerTask('default', ['rebuild', 'test']);
};
