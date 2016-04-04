---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## drawChartFromRecords(chartId, chartType, tableName, columns, *options*, *callback*)

[/name]

[category]

Category: Data

[/category]

[description]

[short_description]

Using App Lab's table data storage, draws a chart of the provided *chartType* in screen element *chartId* using data from *columns* retrieved from the *tableName*.

[/short_description]

Data drives the functionality of modern apps, and being able to analyze and learn something from that data is a valuable skill. Basic charts are used to see patterns and relataionships in data that you cannot see by just looking at the data in tables.

**First time using App Lab table data storage?** Read a short overview of what it is and how to use it [here](/applab/docs/tabledatastorage).

A chart screen element with the element ID of *chartId* must be added to your app in design mode. The available chart types are "bar", "line", "pie" and "scatter". *columns* is an array of strings for the column names from the *tableName* to use in the chart.

**Bar Chart** - The first element in the columns array needs to be the name of a table column containing strings (or unique numbers like years), which specify the names of the bars on the x-axis. The second element (and subsequent elements) in the columns array need to be the name of a table column containing numbers, which determines the height if each bar with a certain color.

**Line Chart** - The first element in the columns array needs to be the name of a table column containing strings (or unique numbers like years), which specify the names of the values on the x-axis. The second element (and subsequent elements) in the columns array need to be the name of a table column containing numbers, which determines the y-axis values for each dot to connect with a certain color.

**Pie Chart** - The first element in the columns array needs to be the name of a table column containing strings, which specify the names of the sections of the pie chart. The second element in the columns array needs to be the name of a table column containing numbers, which determines the percentage amount of the pie chart it gets.

**Scatter Chart** - The first element in the columns array needs to be the name of a table column containing strings (or unique numbers like years), which specify the names of the values on the x-axis. The second element (and subsequent elements) in the columns array need to be the name of a table column containing numbers, which determines the y-axis values for each dot with a certain color.

To View your app's table data, click 'View data' in App Lab and click the table name you want to view.

[/description]

### Examples
____________________________________________________

[example]

```
textLabel("foodChoiceLabel", "Vote for your favorite food:");
dropdown("foodChoices", "","hotdogs", "pasta", "pizza", "tacos");
button("vote", "submit");
onEvent("vote", "click", function() {
  var choice=getText("foodChoices");
  if (choice!=="") {
    readRecords("foodVotes", {name:choice}, function(records) {
      if (records.length===0) {
        createRecord("foodVotes", {name:choice, count:1}, function() { 
        });
      }
      else {
        var newCount=records[0].count+1;
        updateRecord("foodVotes", {id:records[0].id, name:choice, count:newCount}, function() {
        });
      }
    });
  } 
  setText("foodChoices","");
});
button("drawChart", "Draw Chart");
onEvent("drawChart", "click", function() {
  drawChartFromRecords("chart1", "bar", "foodVotes", ["name", "count"]);
});
```
<img src='https://images.code.org/ac629eef7483c160555767570be6c1b3-image-1453117024100.jpg'>

[/example]

____________________________________________________

[example]

**Example: Sales and Price** Display both the count sold and price to see if a relationship exists. Includes use of 'options' parameter on chart.

```
// Display both the count sold and price to see if a relationship exists. Includes use of 'options' parameter on chart.
textLabel("foodChoiceLabel", "Vote for your favorite food:");
dropdown("foodChoices", "","hotdogs $1.50", "pasta $2.00", "pizza $4.50", "tacos $3.00");
var prices = [1.50, 2.00, 4.50, 3.00];
var foodPrice=0;
button("vote", "submit");
onEvent("vote", "click", function() {
  var choice=getText("foodChoices");
  if (choice!=="") {
    if (choice=="hotdogs $1.50") foodPrice=prices[0];
    else if (choice=="pasta $2.00") foodPrice=prices[1];
    else if (choice=="pizza $4.50") foodPrice=prices[2];
    else foodPrice=prices[3];

    readRecords("foodVotesPrice", {name:choice}, function(records) {
      if (records.length===0) {
        createRecord("foodVotesPrice", {name:choice, count:1, price:foodPrice}, function() { 
        });
      }
      else {
        var newCount=records[0].count+1;
        updateRecord("foodVotesPrice", {id:((records[0]).id), name:choice, count:newCount, price:foodPrice}, function() {
        });
      }
    });
  } 
  setText("foodChoices","");
});
button("drawChart", "Draw Chart");
onEvent("drawChart", "click", function() {
  var myOptions={};
  myOptions.bars="horizontal";
  myOptions.title="Sales and Prices";
  myOptions.colors=["blue", "green"];
  myOptions.legend="on";
  drawChartFromRecords("chart1", "bar", "foodVotesPrice", ["name", "count", "price"], myOptions);
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
drawChartFromRecords(chartId, chartType, tableName, columns, options, callback);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| chartId | string | Yes | The unique identifier for the chart screen element. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| chartType | string | Yes | "bar" or "line" or "pie" or "scatter" |
| tableName | string | Yes | The name of the table to retrieve records from. |
| columns | array of strings | Yes | The name of the columns from the table to retrieve records from and display on the chart. |
| options | object | No | Display options for the chart. Either a JavaScript object variable or a JavaScript object defined using curly brace and colon notation (see example above). |
| callback | function | No | The callback function that is asynchronously called when the call to drawChartFromRecords() is finished. |

[/parameters]

[returns]

### Returns
No return. Displays chart.

[/returns]

[tips]

### Tips
- Do not put functions inside a loop that contain asynchronous code, like *drawChartFromRecords()*. The loop will not wait for the callback function to complete.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
