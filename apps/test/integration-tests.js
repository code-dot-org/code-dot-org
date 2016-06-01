var integrationContext = require.context("./integration", false, /Tests?\.js$/);
integrationContext.keys()
  .filter(key => !process.env.mocha_entry || key.indexOf(process.env.TEST_FILE) >= 0)
  .forEach(integrationContext);
