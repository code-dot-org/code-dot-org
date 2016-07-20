// make sure Blockly is loaded
require('./frame')();
var context = require.context('../../build/package/js/en_us/', false, /.*_locale.*\.js$/);
context.keys().forEach(context);

module.exports = window.blockly.common_locale;
