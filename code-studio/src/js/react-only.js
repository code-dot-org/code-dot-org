/**
 * Entry point to build a bundle containing a set of globals used by code-studio.
 * For now this is just React, though if we wanted code-studio to be
 * responsible for providing jQuery, it might belong here too.
 */

window.React = require('react');
window.ReactDOM = require('react-dom');
window.Radium = require('radium');
