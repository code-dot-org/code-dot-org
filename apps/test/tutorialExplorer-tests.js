var testsContext = require.context("./tutorialExplorer", true, /\.js$/);
testsContext.keys()
  .filter(
    key => !process.env.mocha_entry ||
        ('./test/tutorialExplorer' + key.slice(1)).indexOf(process.env.mocha_entry) >= 0
  )
  .forEach(testsContext);
