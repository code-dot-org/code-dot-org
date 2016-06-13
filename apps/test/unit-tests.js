var testsContext = require.context("./unit", true, /\.js$/);
testsContext.keys()
  .filter(
    key => !process.env.mocha_entry ||
        ('./test/unit'+key.slice(1)).indexOf(process.env.mocha_entry) >= 0
  )
  .forEach(testsContext);
