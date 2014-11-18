module.exports = function(grunt) {
  'use strict';

  var path = require('path');
  var fs = require('fs');
  var vm = require('vm');
  var MessageFormat = require('messageformat');

  grunt.registerMultiTask('messages', 'Compile messages!', function() {

    var backends = {};

    var loadBackend = function(lang) {
      if(backends[lang]) {
        return backends[lang];
      } else {
        try {
          var backend = fs.readFileSync(
              './node_modules/messageformat/locale/' + lang + '.js', 'utf8');
          vm.runInNewContext(backend, {MessageFormat: MessageFormat});
          var mf = new MessageFormat(lang);
          var backend_init = {backend: backend, mf: mf};
          backends[lang] = backend_init;
          return backend_init;
        } catch (e) {
          // Fallback to English on failure.
//          grunt.log.warn('Error loading MessageFormat backend: ' + e);
          var fallbackBackend = loadBackend('en');
          backends[lang] = fallbackBackend;
          return fallbackBackend;
        }
      }
    };

    var process = function(locale, src, dest) {
      // Initialize MessageFormat.
      var language = locale.split('_')[0];
      var backend_init = loadBackend(language);
      var backend = backend_init['backend'];
      var mf = backend_init['mf'];

      // Generate javascript message functions.
      var translated = grunt.file.readJSON(src);
      var source = grunt.file.readJSON(src);
      var code = 'var MessageFormat = window.messageformat;';
      code += backend;
      Object.keys(source).forEach(function(key) {
        code += 'exports.' + key + ' = ';
        try {
          if (translated[key]) {
            code += mf.precompile(mf.parse(translated[key]));
          } else {
            code += mf.precompile(mf.parse(source[key]));
          }
        } catch (e) {
          // Fallback to English on failure.
          grunt.log.warn('Failed to compile ' + src + ':' + key + '\n' + e);
          code += mf.precompile(mf.parse(source[key]));
        }
        code += ';\n\n';
      });

      // browserify module pre+postamble
      var namespace = src.indexOf('common') > -1 ? 'locale' : 'appLocale';
      var prepend = '!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),(o.blockly||(o.blockly={})).'+namespace+'=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module "+o+"");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){';
      var append = '},{"messageformat":"messageformat"}]},{},[1])(1)});';

      grunt.file.write(dest, prepend + code + append);
    };

    this.files.forEach(function(filePair) {
      filePair.src.forEach(function(src) {
        var locale = path.basename(src, '.json');
        process(locale, src, filePair.dest);
      });
    });
  });

};
