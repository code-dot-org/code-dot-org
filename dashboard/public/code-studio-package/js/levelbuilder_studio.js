require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({17:[function(require,module,exports){
/**
 * @file Main entry point for scripts used only in levelbuilder on when editing
 *       studio-type levels.
 */
'use strict';
var CodeMirror = require('codemirror');

// On page load, specifically for this editor page.
$(document).ready(function () {
  var jQuerySuccessConditionBox = $('#level_success_condition');
  if (jQuerySuccessConditionBox.length) {
    CodeMirror.fromTextArea(jQuerySuccessConditionBox.get(0), {
      mode: 'javascript',
      viewportMargin: Infinity,
      matchBrackets: true
    });
  }

  var jQueryFailureConditionBox = $('#level_failure_condition');
  if (jQueryFailureConditionBox.length) {
    CodeMirror.fromTextArea(jQueryFailureConditionBox.get(0), {
      mode: 'javascript',
      viewportMargin: Infinity,
      matchBrackets: true
    });
  }
});

},{"codemirror":6}]},{},[17])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbGV2ZWxidWlsZGVyX3N0dWRpby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGZpbGUgTWFpbiBlbnRyeSBwb2ludCBmb3Igc2NyaXB0cyB1c2VkIG9ubHkgaW4gbGV2ZWxidWlsZGVyIG9uIHdoZW4gZWRpdGluZ1xuICogICAgICAgc3R1ZGlvLXR5cGUgbGV2ZWxzLlxuICovXG4ndXNlIHN0cmljdCc7XG52YXIgQ29kZU1pcnJvciA9IHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcblxuLy8gT24gcGFnZSBsb2FkLCBzcGVjaWZpY2FsbHkgZm9yIHRoaXMgZWRpdG9yIHBhZ2UuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gIHZhciBqUXVlcnlTdWNjZXNzQ29uZGl0aW9uQm94ID0gJCgnI2xldmVsX3N1Y2Nlc3NfY29uZGl0aW9uJyk7XG4gIGlmIChqUXVlcnlTdWNjZXNzQ29uZGl0aW9uQm94Lmxlbmd0aCkge1xuICAgIENvZGVNaXJyb3IuZnJvbVRleHRBcmVhKGpRdWVyeVN1Y2Nlc3NDb25kaXRpb25Cb3guZ2V0KDApLCB7XG4gICAgICBtb2RlOiAnamF2YXNjcmlwdCcsXG4gICAgICB2aWV3cG9ydE1hcmdpbjogSW5maW5pdHksXG4gICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICB2YXIgalF1ZXJ5RmFpbHVyZUNvbmRpdGlvbkJveCA9ICQoJyNsZXZlbF9mYWlsdXJlX2NvbmRpdGlvbicpO1xuICBpZiAoalF1ZXJ5RmFpbHVyZUNvbmRpdGlvbkJveC5sZW5ndGgpIHtcbiAgICBDb2RlTWlycm9yLmZyb21UZXh0QXJlYShqUXVlcnlGYWlsdXJlQ29uZGl0aW9uQm94LmdldCgwKSwge1xuICAgICAgbW9kZTogJ2phdmFzY3JpcHQnLFxuICAgICAgdmlld3BvcnRNYXJnaW46IEluZmluaXR5LFxuICAgICAgbWF0Y2hCcmFja2V0czogdHJ1ZVxuICAgIH0pO1xuICB9XG59KTtcbiJdfQ==
