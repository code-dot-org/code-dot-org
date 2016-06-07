var integrationContext = require.context("./integration", false, /Tests?\.js$/);
integrationContext.keys()
  .filter(
        key => !process.env.mocha_entry ||
      ('./test/integration'+key.slice(1)).indexOf(process.env.mocha_entry) >= 0
  )
  .forEach(integrationContext);
