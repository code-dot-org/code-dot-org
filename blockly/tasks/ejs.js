module.exports = function(grunt) {
  'use strict';

  var ejs = require('ejs');
  var path = require('path');

  var compile = function(filename, template) {
    var code = 'module.exports= (function() {\n';
    code += '  var t = ';
    code += ejs.compile(template, {
      filename: filename,
      client: true,
      cache: false,
      compileDebug: false
    });
    code += ';\n';
    code += '  return function(locals) {\n';
    code += '    return t(locals, require("ejs").filters);\n';
    code += '  }\n';
    code += '}());';
    return code;
  };

  grunt.registerMultiTask('ejs', 'compile ejs templates', function() {

    var srcBase = this.data.srcBase;
    var destBase = this.data.destBase;

    var pattern = srcBase + '/**/*.ejs';
    var files = grunt.file.expandMapping(pattern, destBase, {
      expand: true,
      rename: function(destBase, destPath) {
        var filename = destPath.replace('src/', '').replace('.ejs', '.js');
        return path.join(destBase, filename);
      }
    });

    files.forEach(function(file) {
      var filename = file.src[0];
      var code = compile(filename, grunt.file.read(filename));
      grunt.file.write(file.dest, code);
    });

  });

};
