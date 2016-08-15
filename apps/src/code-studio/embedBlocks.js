/**
 * Entry point to build a bundle containing a set of globals used when displaying
 * embedded blocks via blockly-in-an-iframe.
 */
require('babel-polyfill');
window.React = require('react');
window.ReactDOM = require('react-dom');
window.Radium = require('radium');
