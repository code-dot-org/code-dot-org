/*
Hannah

Trying some options for simplifying data blocks. 
- need to work on reducing the parameters

*/

function barTableChart (chartID, tableID, columnOne, columnTwo, color, orientation, title){
  console.log("Parameters: chartID, tableID, columnOne, ColumnTwo, color, orientation, title");
  var myOptions={};
  myOptions.bars=orientation;
  myOptions.title=title;
  myOptions.colors=[color];
  myOptions.legend={position: "right"};
  drawChartFromRecords(chartID, "bar", tableID, [columnOne, columnTwo], myOptions);
}

function scatterTableChart (chartID, tableID, columnOne, columnTwo, color, title){
  console.log("Parameters: chartID, tableID, columnOne, ColumnTwo, color, title");
  var myOptions={};
  myOptions.title=title;
  myOptions.colors=[color];
  myOptions.legend={position: "right"};
  drawChartFromRecords(chartID, "scatter", tableID, [columnOne, columnTwo], myOptions);
}

function lineTableChart (chartID, tableID, columnOne, columnTwo, color, title){
  console.log("Parameters: chartID, tableID, columnOne, ColumnTwo, color, title");
  var myOptions={};
  myOptions.title=title;
  myOptions.colors=[color];
  myOptions.legend={position: "right"};
  drawChartFromRecords(chartID, "line", tableID, [columnOne, columnTwo], myOptions);
}

function pieTableChart (chartID, tableID, columnOne, columnTwo, title){
  console.log("Parameters: chartID, tableID, columnOne, ColumnTwo, title");
  var myOptions={};
  myOptions.title=title;
  myOptions.legend={position: "right"};
  drawChartFromRecords(chartID, "pie", tableID, [columnOne, columnTwo], myOptions);
}