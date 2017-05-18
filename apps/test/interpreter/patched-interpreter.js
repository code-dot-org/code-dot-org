/**
 * @file this file exports a version of js-interpreter that has been
 * monkey patched with our customizations so we can run it against
 * the js-interpreter's test suite.
 */
module.exports = require('../../src/lib/tools/jsinterpreter/CustomMarshalingInterpreter');
