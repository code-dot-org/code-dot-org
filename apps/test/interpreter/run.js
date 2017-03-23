const exec = require('child_process').exec;
const path = require('path');


const TEST_REPORTER_PATH = './node_modules/@code-dot-org/js-interpreter/tests/build-test-report.js';
const INTERPRETER_MODULE = require.resolve('./patched-interpreter.js');
const process = exec(
  `${TEST_REPORTER_PATH} -rd --interpreter ${INTERPRETER_MODULE}`,
  {
    cwd: path.resolve(__dirname, '../..')
  }
);
process.on('error', err => {
  console.error(err);
});

process.on('exit', (code, signal) => {
  console.log("all done...");
});
