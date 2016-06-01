var testsContext = require.context("./unit", true, /\.js$/);
testsContext.keys()
  .filter(key => !process.env.mocha_entry || key.indexOf(process.env.TEST_FILE) >= 0)
  .forEach(testsContext);
