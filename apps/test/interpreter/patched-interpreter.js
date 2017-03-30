/**
 * @file this file exports a version of js-interpreter that has been
 * monkey patched with our customizations so we can run it against
 * the js-interpreter's test suite.
 */

const Interpreter = require('@code-dot-org/js-interpreter');
const patchInterpreter = require('../../src/lib/tools/jsinterpreter/patchInterpreter');

patchInterpreter();

// Now we export the monkey patched version of the js-interpreter module.
module.exports = Interpreter;
