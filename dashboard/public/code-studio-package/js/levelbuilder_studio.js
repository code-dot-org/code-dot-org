require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({185:[function(require,module,exports){
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

},{"codemirror":7}]},{},[185])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS91YnVudHUvc3RhZ2luZy9jb2RlLXN0dWRpby9zcmMvanMvbGV2ZWxidWlsZGVyX3N0dWRpby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNJQSxZQUFZLENBQUM7QUFDYixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7OztBQUd2QyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVk7QUFDNUIsTUFBSSx5QkFBeUIsR0FBRyxDQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUM5RCxNQUFJLHlCQUF5QixDQUFDLE1BQU0sRUFBRTtBQUNwQyxjQUFVLENBQUMsWUFBWSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUN4RCxVQUFJLEVBQUUsWUFBWTtBQUNsQixvQkFBYyxFQUFFLFFBQVE7QUFDeEIsbUJBQWEsRUFBRSxJQUFJO0tBQ3BCLENBQUMsQ0FBQztHQUNKOztBQUVELE1BQUkseUJBQXlCLEdBQUcsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDOUQsTUFBSSx5QkFBeUIsQ0FBQyxNQUFNLEVBQUU7QUFDcEMsY0FBVSxDQUFDLFlBQVksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDeEQsVUFBSSxFQUFFLFlBQVk7QUFDbEIsb0JBQWMsRUFBRSxRQUFRO0FBQ3hCLG1CQUFhLEVBQUUsSUFBSTtLQUNwQixDQUFDLENBQUM7R0FDSjtDQUNGLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBmaWxlIE1haW4gZW50cnkgcG9pbnQgZm9yIHNjcmlwdHMgdXNlZCBvbmx5IGluIGxldmVsYnVpbGRlciBvbiB3aGVuIGVkaXRpbmdcbiAqICAgICAgIHN0dWRpby10eXBlIGxldmVscy5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIENvZGVNaXJyb3IgPSByZXF1aXJlKCdjb2RlbWlycm9yJyk7XG5cbi8vIE9uIHBhZ2UgbG9hZCwgc3BlY2lmaWNhbGx5IGZvciB0aGlzIGVkaXRvciBwYWdlLlxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICB2YXIgalF1ZXJ5U3VjY2Vzc0NvbmRpdGlvbkJveCA9ICQoJyNsZXZlbF9zdWNjZXNzX2NvbmRpdGlvbicpO1xuICBpZiAoalF1ZXJ5U3VjY2Vzc0NvbmRpdGlvbkJveC5sZW5ndGgpIHtcbiAgICBDb2RlTWlycm9yLmZyb21UZXh0QXJlYShqUXVlcnlTdWNjZXNzQ29uZGl0aW9uQm94LmdldCgwKSwge1xuICAgICAgbW9kZTogJ2phdmFzY3JpcHQnLFxuICAgICAgdmlld3BvcnRNYXJnaW46IEluZmluaXR5LFxuICAgICAgbWF0Y2hCcmFja2V0czogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgdmFyIGpRdWVyeUZhaWx1cmVDb25kaXRpb25Cb3ggPSAkKCcjbGV2ZWxfZmFpbHVyZV9jb25kaXRpb24nKTtcbiAgaWYgKGpRdWVyeUZhaWx1cmVDb25kaXRpb25Cb3gubGVuZ3RoKSB7XG4gICAgQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEoalF1ZXJ5RmFpbHVyZUNvbmRpdGlvbkJveC5nZXQoMCksIHtcbiAgICAgIG1vZGU6ICdqYXZhc2NyaXB0JyxcbiAgICAgIHZpZXdwb3J0TWFyZ2luOiBJbmZpbml0eSxcbiAgICAgIG1hdGNoQnJhY2tldHM6IHRydWVcbiAgICB9KTtcbiAgfVxufSk7XG4iXX0=
