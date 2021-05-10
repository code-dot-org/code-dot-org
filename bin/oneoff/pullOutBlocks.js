#!/usr/bin/node

/*
  This was a one off script used to create .json files for each block in App Lab and Game Lab.
  The json files will be used to seed ProgrammingExpressions.
 */

var fs = require("fs");

var applabBlocksToImport = [
  // Add dropletConfig definition of the blocks you want to import here
];

var gamelabBlocksToImport = [
  // Add dropletConfig definition of the blocks you want to import here
];

applabBlocksToImport.forEach(block => {
  fs.writeFile(
    `dashboard/config/programming_expressions/applab/${block.func}.json`,
    JSON.stringify(block, null, 2),
    function(err) {
      if (err) {
        throw err;
      }
      console.log(
        `Saved! dashboard/config/programming_expressions/applab/${
          block.func
        }.json`
      );
    }
  );
});

gamelabBlocksToImport.forEach(block => {
  fs.writeFile(
    `dashboard/config/programming_expressions/gamelab/${block.func}.json`,
    JSON.stringify(block, null, 2),
    function(err) {
      if (err) {
        throw err;
      }
      console.log(
        `Saved! dashboard/config/programming_expressions/gamelab/${
          block.func
        }.json`
      );
    }
  );
});
