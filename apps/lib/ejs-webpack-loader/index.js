/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Vasily Ostanin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * This is a fork of https://github.com/rorkflash/ejs-webpack-loader
 *
 * This fork can be removed when Code.org removes the usage of EJS in the code base.
 *
 * Code.org changes:
 * 1. Remove dependency on HTML minifier (not used by Code.org)
 * 2. Update to be compatible with webpack v5
 * 3. Update loader-utils to 2.x
 */

var ejs = require('ejs'),
  utils = require('loader-utils'),
  merge = require('merge'),
  path = require('path'),
  UglifyJS = require('uglify-js');

module.exports = function (source) {
  this.cacheable && this.cacheable();
  var opts =
    typeof this.options === 'object'
      ? this.options['ejs-compiled-loader'] || {}
      : {};
  opts =
    typeof utils.getOptions === 'function'
      ? merge(utils.getOptions(this), opts)
      : opts;

  // eslint-disable-next-line eqeqeq
  if (opts.client == undefined) {
    opts.client = true;
  }

  // Skip compile debug for production when running with
  // webpack --optimize-minimize
  if (this.minimize && opts.compileDebug === undefined) {
    opts.compileDebug = false;
  }

  // Use filenames relative to working dir, which should be project root
  opts.filename = path.relative(process.cwd(), this.resourcePath);

  var template = ejs.compile(source, opts);

  // Beautify javascript code
  if (this.loaders.length > 1) {
    template = JSON.stringify(template(opts['data'] || {}));
  } else {
    if (!this.minimize && opts.beautify !== false) {
      var ast = UglifyJS.parse(template.toString());
      ast.figure_out_scope();
      template = ast.print_to_string({beautify: true});
    }
  }
  return 'module.exports = ' + template;
};
