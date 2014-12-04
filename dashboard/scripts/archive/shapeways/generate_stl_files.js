var fs = require('fs');
CSG = require('./csg.js').CSG;

var SCALE = 0.7;
var ROUNDED = false;

var levelPointFiles = [
  {
    scale: 0.7,
    fileName: './6.json'
  },
  {
    scale: 0.7,
    fileName: './9.json'
  },
  {
    scale: 0.6,
    fileName: './12.json'
  },
  {
    scale: 0.8,
    fileName: './19.json'
  },
  {
    scale: 0.9,
    fileName: './17.json'
  },
  {
    scale: 0.5,
    fileName: './15.json'
  }
];

levelPointFiles.forEach(function(levelPointFile) {
  var fileName = levelPointFile.fileName;
  shapewaysPrintablePathPoints = require(fileName);
  var solidString = (new CSG.Path2D(shapewaysPrintablePathPoints))
    .rectangularExtrude(4, 5, 16, ROUNDED)
    .scale(levelPointFile.scale).toStlString();
  var stlFileName = fileName + "." + levelPointFile.scale + "." + Date.now() + ".stl";
  fs.writeFile(stlFileName, solidString, function(err) {
    console.log(err ? err : "The file was saved! At path: " + stlFileName);
  });
});

