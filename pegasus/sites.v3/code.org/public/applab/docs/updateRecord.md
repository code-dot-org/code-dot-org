---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## updateRecord(table, record, callback)

[/name]

[category]

Category: Data

[/category]

[description]

[short_description]

Using App Lab's table data storage, updates the record from the provided table with the matching record id, and calls the callback function when the action is finished. The updated record and a boolean variable success is returned as a parameter to the callback function.

[/short_description]

Adding permanent data storage to your apps is the last step to making them real-world. The apps you use everyday are driven by data "in the cloud".

**First time using App Lab table data storage?** Read a short overview of what it is and how to use it [here](/applab/docs/tabledatastorage).

The *record* parameter must be a javascript object variable or a javascript object defined using curly brace and colon notation AND must contain the *id* property (see examples below). Data is only accessible to the app that created the table. 

To View your app's table data, click 'View data' in App Lab and click the table name you want to view.

[/description]

### Examples
____________________________________________________

[example]

```
textInput("nameInput", "What is your name?");
textInput("ageInput", "What is your age?");
textInput("foodInput", "What is your favorite food?");
button("submitButton", "Submit");
button("updateButton", "Update Most Recent Record to Pizza");
var mostRecentID=1;

onEvent("submitButton", "click", function() {
  var favFoodData={};
  favFoodData.name = getText("nameInput");
  favFoodData.age = getNumber("ageInput");
  favFoodData.food = getText("foodInput");
  createRecord("fav_foods", favFoodData, function(record) {
    mostRecentID=record.id;
    console.log("Record created with id:" + record.id);
    console.log("Name:" + record.name + " Age:" + record.age + " Food:" + record.food);
  });
});

onEvent("updateButton", "click", function() {
  updateRecord("fav_foods", {id:mostRecentID,name:"Bobby",age:16,food:"pizza"}, function(record, success) {
    if (success) {
      console.log("Record updated with id:" + mostRecentID);
    }
    else {
      console.log("No record to update with id:" + mostRecentID);
    }      
  });
});

```

[/example]

____________________________________________________

[example]

**One of these fruits is not like the others** Find and replace sushi with pineapples.

```
// Find and replace sushi with pineapples.
var fruit = ["sushi", "apples", "oranges", "bananas"];
createRecord("fruitTable", {food:fruit[randomNumber(0,fruit.length-1)]}, function(record) {
  console.log("Created: Id:" + record.id + " food:" + record.food);
});
createRecord("fruitTable", {food:fruit[randomNumber(0,fruit.length-1)]}, function(record) {
  console.log("Created: Id:" + record.id + " food:" + record.food);
});
createRecord("fruitTable", {food:fruit[randomNumber(0,fruit.length-1)]}, function(record) {
  console.log("Created: Id:" + record.id + " food:" + record.food);
});
createRecord("fruitTable", {food:fruit[randomNumber(0,fruit.length-1)]}, function(record) {
  console.log("Created: Id:" + record.id + " food:" + record.food);
});
createRecord("fruitTable", {food:fruit[randomNumber(0,fruit.length-1)]}, function(record) {
  console.log("Created: Id:" + record.id + " food:" + record.food);
});

button("findReplace", "Find & Replace Sushi");
onEvent("findReplace", "click", function() {
  readRecords("fruitTable", {food:"sushi"}, function(records) {
    if (records.length>0) {    
      var updatedRecord = records[0];
      updatedRecord.food = "pineapples";
      updateRecord("fruitTable", updatedRecord, function(record, success) {
        if (success) write("Record updated with id:" +record.id);
        else write("Record NOT updated");
      });
    }
    else write("No sushi record found");
  });
});

```

[/example]

____________________________________________________

[syntax]

### Syntax

```
updateRecord(table, record, function(record, success){
    //callback function code goes here
  });
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| table | string | Yes | The name of the table to update a record. |
| record | object | Yes | The new data to update the record with matching id. Either a javascript object variable or a javascript object defined using curly brace and colon notation (see examples above). |
| callback | function | Yes | The callback function that is asynchronously called when the call to updateRecord() is finished. The updated record and a boolean variable success is returned as a parameter to the callback function. |

[/parameters]

[returns]

### Returns
When *updateRecord()* is finished executing, the callback function is automatically called and passed the updated record and as boolean success as parameters.

[/returns]

[tips]

### Tips
- The javascript object properties must match the App Lab table column names. Both are case sensitive.
- *updateRecord()* has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- The callback function can be inline, or separately defined in your app and called from *updateRecord()*.
- Do not put functions inside a loop that contain asynchronous code, like updateRecord(). The loop will not wait for the callback function to complete.
- Use with [createRecord()](/applab/docs/createRecord), [readRecords()](/applab/docs/readRecords), and [deleteRecord()](/applab/docs/updateRecord) records to create, read, and delete records in a table.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
