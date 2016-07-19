var testsContext = require.context("./code-studio", true, /\.js$/);
testsContext.keys()
  .filter(
    key => !process.env.mocha_entry ||
        ('./test/code-studio' + key.slice(1)).indexOf(process.env.mocha_entry) >= 0
  )
  .forEach(testsContext);
