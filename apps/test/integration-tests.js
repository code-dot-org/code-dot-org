var integrationContext = require.context("./integration", false, /Tests?\.js$/);
integrationContext.keys()
  .filter(key => !process.env.TEST_FILE || key.indexOf(process.env.TEST_FILE) >= 0)
  .forEach(integrationContext);
