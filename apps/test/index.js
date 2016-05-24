var testsContext = require.context("./unit", true, /\.js$/);
testsContext.keys().forEach(testsContext);
