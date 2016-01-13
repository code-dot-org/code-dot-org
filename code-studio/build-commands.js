/** @file Build commands for use by build scripts in the code-studio package. */
'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var child_process = require('child_process');
var path = require('path');

/**
 * Generate command to:
 * Bundle JavaScript files using Browserify, break out common code using
 * factor-bundle, and (optionally) minify output using uglify and (optionally)
 * run watch in watch mode using watchify
 * @param {object} config
 * @param {string} config.srcPath - Path to root of JavaScript source files, absolute
 *        or relative to execution path for this script (which is the code-studio
 *        folder for this build system), with trailing slash.
 * @param {string} config.buildPath - Path to root of output directory, absolute or
 *        relative to execution path for this script (which is the code-studio
 *        folder for this build system), with trailing slash.
 * @param {(string[])[]} config.filenames - List of entry points (relative to
          srcPath)
 * @param {string} config.commonFile - Filename for where to output common code
 *        (relative to buildPath)
 * @param {boolean} config.shouldFactor if true, we will factor out common code
 *        into config.commonFile. With non-common code ending up in <filenames>.js
 *        If false, everything ends up in config.commonFile.
 * @param {boolean} config.shouldMinify if true, will build minified
 *        output files (with .min.js extensions) instead of unminified output.
 * @param {boolean} config.shouldWatch if true, will watch file system for
 *        changes, and rebuild when it detects them
 * @returns {string}
 */
exports.browserify = function (config) {
  var srcPath = config.srcPath;
  var buildPath = config.buildPath;
  var filenames = config.filenames;
  var commonFile = config.commonFile;
  var shouldFactor = config.shouldFactor;
  var shouldMinify = config.shouldMinify;
  var shouldWatch = config.shouldWatch;

  var fileInput = filenames.map(function (file) {
    return srcPath + file;
  }).join(" \\\n    ");

  var extension = (shouldMinify ? '.min.js' : '.js');

  // The React library checks the NODE_ENV variable in several places to decide
  // whether to enable special debugging features.  By setting this environment
  // variable, envify will do an inline replacement anywhere `process.env.NODE_ENV`
  // is used (envify is implicitly part of the browserify step, since we depend
  // on 'react') and then uglify will perform dead code removal that strips all
  // of those debug paths from our minified output.
  var customEnvironment = (shouldMinify ? 'NODE_ENV=production' : '');

  var command = (shouldWatch ? 'watchify -v' : 'browserify') +
    (shouldMinify ? '' : ' --debug');
  
  var babelifyStep = '-t [ babelify --compact=false --sourceMap --sourceMapRelative="$PWD" ]';

  // Uglify shrinks our output down as small as possible.
  // --compress performs lots of optimizations including removal of dead code.
  // warnings=false disables compressor warnings (which don't indicate actual problems, for us)
  // --mangle replaces variable names with short representations
  var uglifyCommand = 'uglifyjs --compress warnings=false --mangle';

  var factorStep = '';
  if (shouldFactor) {
    // We use command substitution to build an output filename based on
    // the input filename, which factor-bundle automatically binds to $FILE.
    var factoredOutputFilename = buildPath + '`';

    // The output file ends up at the same path relative to the build directory
    // as the input file is relative to the src directory:
    // @see `man realpath`
    factoredOutputFilename += 'realpath --relative-to ' + srcPath + ' $FILE';

    // And we swap out the input file extension (.js or .jsx) for an output
    // file extension (.js or .min.js) depending on our configuration.
    // @see `man sed`
    factoredOutputFilename += ' | sed -r "s/\.jsx?$/' + extension + '/i"';

    // Finally, we close the command substitution
    factoredOutputFilename += '`';

    // Use bracket syntax to invoke the factor-bundle plugin with one argument:
    // A command that accepts each factored output file as it's processed.
    factorStep = "-p [ factor-bundle -o '" +
        (shouldMinify ? uglifyCommand : '') +
        ' > ' + factoredOutputFilename + "' ]";
  }
  var commonOutput = (shouldMinify ? '| ' + uglifyCommand + ' ' : '') +
    '-o ' + buildPath + path.basename(commonFile, '.js') + extension;

  return [
    customEnvironment,
    command,
    babelifyStep,
    fileInput,
    factorStep,
    commonOutput
  ].filter(function (part) {
    return part.length > 0;
  }).join(" \\\n    ");
};

/**
 * Generate command to:
 * Copy one one directory (and entire contents) into another, only updating
 * if source file is newer or destination file is missing.
 * @param {!string} srcDir - Note: If you use trailing slash, the directory's
 *                  contents will be copied into destDir.  If you omit the
 *                  the trailing slash, the directory itself will be copied
 *                  to destDir.  See `man rsync` for more info.
 * @param {!string} destDir
 * @returns {string}
 */
exports.copyDirectory = function (srcDir, destDir) {
  return 'rsync -av ' + srcDir + ' ' + destDir;
};

/**
 * Generate command to:
 * Creates given director(y|ies) to any depth if it does not exist, no-op if
 * it does already exist.
 * @param {!string} dir
 * @returns {string}
 */
exports.ensureDirectoryExists = function (dir) {
  return 'mkdir -p ' + dir;
};

/**
 * Execute a sequence of shell commands as a build script, with useful output
 * wherever possible.
 * Will call process.exit() if the command fails for any reason.
 * @param {string[]} commands - array of shell commands to be executed in sequence.
 */
exports.execute = function (commands) {
  commands.forEach(function (command) {
    console.log(command);

    try {
      // For documentation on synchronous execution of shell commands from node scripts, see:
      // https://nodejs.org/docs/latest/api/child_process.html#child_process_synchronous_process_creation
      var result = child_process.execSync(command, {
        env: _.extend({}, process.env, {
          PATH: './node_modules/.bin:' + process.env.PATH
        }),
        stdio: 'inherit'
      });
    } catch (e) {
      console.log("\nError: " + e.message);
      warnIfWrongNodeVersion();
      process.exit(e.status || 1);
    }
  });
};


/**
 * Log a message in a box, so it stands out from the rest of the logging info.
 * @param {!string} message
 */
exports.logBoxedMessage = function (message) {
  var style = chalk.bold.green.bgBlack;
  var bar = style('+' + _.repeat('-', message.length + 2) + '+');
  console.log(bar + "\n" + style("| " + chalk.white(message) + " |") + "\n" + bar + "\n");
};

/**
 * Generate command to:
 * Process scss files into css files using node-sass.
 * @param {string} srcPath - Path to root of SCSS source files, absolute
 *        or relative to execution path for this script (which is the code-studio
 *        folder for this build system), with trailing slash.
 * @param {string} buildPath - Path to root of output directory, absolute or
 *        relative to execution path for this script (which is the code-studio
 *        folder for this build system), with trailing slash.
 * @param {string} file - SCSS file to build, given as a path rooted at
 *        the srcPath given.  Maps to an output file with a corresponding name.
 * @param {string[]} includePaths - List of paths to search for files included
 *        via scss import directives, rooted at the working directory, with NO
 *        trailing slash.
 * @param {boolean} [shouldMinify] if provided and TRUE, will build minified
 *        output files (with .min.css extensions) instead of unminified output.
 * @returns {string}
 */
exports.sass = function (srcPath, buildPath, file, includePaths, shouldMinify) {
  var command = 'node-sass' + (shouldMinify ? ' --output-style compressed' : '');
  var extension = (shouldMinify ? '.min.css' : '.css');
  var includePathArgs = includePaths.map(function (path) {
    return '--include-path ' + path;
  }).join(" \\\n    ");

  return [
    command,
    includePathArgs,
    srcPath + file,
    buildPath + path.basename(file, '.scss') + extension
  ].join(" \\\n    ");
};

/**
 * Checks current node version, prints a warning if the expected version is not
 * currently being used.
 */
function warnIfWrongNodeVersion() {
  if (!/0\.12/.test(process.version)) {
    console.log('You are using node ' + process.version + '. This build script expects v0.12.x.');
  }
}
