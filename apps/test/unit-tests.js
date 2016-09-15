// This gets replaced by karma webpack with the updated files on rebuild
import 'babel-polyfill';
var __karmaWebpackManifest__ = [];

function inManifest(path) {
  return __karmaWebpackManifest__.indexOf(path) >= 0;
}


var testsContext = require.context("./unit", true, /\.js$/);

var runnable = testsContext.keys().filter(inManifest);

// Run all tests if we didn't find any changes
if (!runnable.length) {
  runnable = testsContext.keys();
}

runnable.forEach(testsContext);
