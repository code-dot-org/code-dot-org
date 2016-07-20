/**
 * There are some cases (i.e. playground-io's repl), where third party modules
 * include a bunch of modules that we don't want to end up in our webpack bundle
 * In those cases, we can alias to this noop export, so that something like
 * require('repl') ends up with an empty object.
 */
module.exports = {};
