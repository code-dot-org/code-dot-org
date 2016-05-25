var testsContext = require.context("./unit", true, /\.js$/);
testsContext.keys().forEach(testsContext);

var integrationContext = require.context("./integration", false, /Tests?\.js$/);
integrationContext.keys().forEach(integrationContext);
