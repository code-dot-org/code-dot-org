var testsContext = require.context("./unit", true, /\.js$/);
testsContext.keys()
  .filter(key => !process.env.TEST_FILE || key.indexOf(process.env.TEST_FILE) >= 0)
  .forEach(testsContext);
