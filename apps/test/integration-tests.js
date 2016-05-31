var integrationContext = require.context("./integration", false, /Tests?\.js$/);
integrationContext.keys().forEach(integrationContext);
