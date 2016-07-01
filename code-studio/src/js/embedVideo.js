/**
 * @file Lightweight bundle for embedded video player.  This build product is
 *       included in the page defined at dashboard/app/views/videos/embed.html.haml
 *       and is used on pages that do _not_ include code-studio.js, so we define
 *       certain globals on our own.
 */

// Define jQuery
window.$ = require('jquery');

// Shim window.console to be safe in IE.
require('./consoleShim')(window);

// Provide video player functionality
window.dashboard = window.dashboard || {};
window.dashboard.videos = require('./videos');
