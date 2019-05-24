---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## drawChart(chartId, chartType, chartData, *options*, *callback*)

[/name]

[category]

Category: Data

[/category]

[description]

[short_description]

Using the given data *chartData*, draws a chart of the provided *chartType* in screen element *chartId*.

[/short_description]

Data drives the functionality of modern apps, and being able to analyze and learn something from that data is a valuable skill. Basic charts are used to see patterns and relataionships in data that you cannot see by just looking at the raw data.

A chart screen element with the element ID of *chartId* must be added to your app in design mode. The available chart types are "bar", "line", "pie" and "scatter". *chartData" is an array of JSON objects to use in the chart.

Bar Chart - The first attribute in the JSON object needs to contain strings (or unique numbers like years), which specify the names of the bars on the x-axis. The second JSON attribute (and subsequent attributes) needs to contain numbers, which determines the height if each bar with a certain color.

Line Chart - The first attribute in the JSON object needs to contain strings (or unique numbers like years), which specify the names of the values on the x-axis. The second JSON attribute (and subsequent attributes) needs to contain numbers, which determines the y-axis values for each dot to connect with a certain color.

Pie Chart - The first attribute in the JSON object needs to contain strings (or unique numbers like years), which specify the names of the sections of the pie chart. The second JSON attribute needs to contain numbers, which determines the percentage amount of the pie chart it gets.

Scatter Chart - The first attribute in the JSON object needs to contain strings (or unique numbers like years), which specify the names of the values on the x-axis. The second JSON attribute (and subsequent attributes) needs to contain numbers, which determines the y-axis values for each dot with a certain color.

[/description]

### Examples
____________________________________________________

[example]

```
var data = [{ movie:"Avatar", grossBillions:2.788},
{movie:"Titanic", grossBillions:2.186},
{movie:"Star Wars: The Force Awakens", grossBillions:1.871},
{movie:"Jurassic World", grossBillions:1.669},
{movie:"Marvel's The Avengers", grossBillions:1.519}];
drawChart("chart1", "bar", data);
```
[/example]

____________________________________________________

[example]

**Example: Sales and Tomatoes** Display both the gross sales and Rotten Tomatoes percentage to see if a relationship exists. Includes use of 'options' paraemter on chart.

```
var data = [{ movie:"Avatar", grossBillions:2.788, tomatoes:0.83},
{movie:"Titanic", grossBillions:2.186, tomatoes:0.88},
{movie:"Star Wars: The Force Awakens", grossBillions:1.871, tomatoes:0.93},
{movie:"Jurassic World", grossBillions:1.669, tomatoes:0.71},
{movie:"Marvel's The Avengers", grossBillions:1.519, tomatoes:0.92}];
var myOptions={};
myOptions.bars="vertical";
myOptions.title="Gross Sales in Billions and Rotten Tomatoes Percentage";  
myOptions.colors=["green", "red"];
myOptions.legend="on";
drawChart("chart1", "bar", data, myOptions);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
drawChart(chartId, chartType, tableName, chartData, options, callback);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| chartId | string | Yes | The unique identifier for the chart screen element. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| chartType | string | Yes | "bar" or "line" or "pie" or "scatter" |
| chartData | array of objects | Yes | The data to plot on the chart. |
| options | object | No | Display options for the chart. Either a javascript object variable or a javascript object defined using curly brace and colon notation (see example above). |
| callback | function | No | The callback function that is asynchronously called when the call to drawChart() is finished. |

[/parameters]

[returns]

### Returns
No return. Displays chart.

[/returns]

[tips]

### Tips
- Do not put functions inside a loop that contain asynchronous code, like *drawChart()*. The loop will not wait for the callback function to complete.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
