require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({19:[function(require,module,exports){
/**
 * @file JavaScript loaded in all Widget-type levels.
 */
/* global apps, appOptions, dashboard */
'use strict';

var _ = require('lodash');

function setupWidgetLevel() {
  window.script_path = location.pathname;
  apps.setupApp(appOptions);
  appOptions.showInstructionsWrapper(dashboard.dialog.showInstructionsDialog);
  window.getResult = function () {
    return {
      response: 'ok',
      result: true
    };
  };
  window.options = appOptions.level;
}

// Add globals
window.CodeMirror = require('codemirror');
window.dashboard = window.dashboard || {};
_.extend(window.dashboard, {
  setupWidgetLevel: setupWidgetLevel
});

// On load (note - widget-specific setup may happen before this!)
$(document).ready(function () {
  $('#bubble').click(dashboard.dialog.showInstructionsDialog);
});

},{"codemirror":6,"lodash":11}]},{},[19])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbGV2ZWx0eXBlX3dpZGdldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBmaWxlIEphdmFTY3JpcHQgbG9hZGVkIGluIGFsbCBXaWRnZXQtdHlwZSBsZXZlbHMuXG4gKi9cbi8qIGdsb2JhbCBhcHBzLCBhcHBPcHRpb25zLCBkYXNoYm9hcmQgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuZnVuY3Rpb24gc2V0dXBXaWRnZXRMZXZlbCgpIHtcbiAgd2luZG93LnNjcmlwdF9wYXRoID0gbG9jYXRpb24ucGF0aG5hbWU7XG4gIGFwcHMuc2V0dXBBcHAoYXBwT3B0aW9ucyk7XG4gIGFwcE9wdGlvbnMuc2hvd0luc3RydWN0aW9uc1dyYXBwZXIoZGFzaGJvYXJkLmRpYWxvZy5zaG93SW5zdHJ1Y3Rpb25zRGlhbG9nKTtcbiAgd2luZG93LmdldFJlc3VsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzcG9uc2U6ICdvaycsXG4gICAgICByZXN1bHQ6IHRydWVcbiAgICB9O1xuICB9O1xuICB3aW5kb3cub3B0aW9ucyA9IGFwcE9wdGlvbnMubGV2ZWw7XG59XG5cbi8vIEFkZCBnbG9iYWxzXG53aW5kb3cuQ29kZU1pcnJvciA9IHJlcXVpcmUoJ2NvZGVtaXJyb3InKTtcbndpbmRvdy5kYXNoYm9hcmQgPSB3aW5kb3cuZGFzaGJvYXJkIHx8IHt9O1xuXy5leHRlbmQod2luZG93LmRhc2hib2FyZCwge1xuICBzZXR1cFdpZGdldExldmVsOiBzZXR1cFdpZGdldExldmVsXG59KTtcblxuLy8gT24gbG9hZCAobm90ZSAtIHdpZGdldC1zcGVjaWZpYyBzZXR1cCBtYXkgaGFwcGVuIGJlZm9yZSB0aGlzISlcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgJCgnI2J1YmJsZScpLmNsaWNrKGRhc2hib2FyZC5kaWFsb2cuc2hvd0luc3RydWN0aW9uc0RpYWxvZyk7XG59KTtcbiJdfQ==
