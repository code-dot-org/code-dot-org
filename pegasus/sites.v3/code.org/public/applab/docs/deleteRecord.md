---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## deleteRecord(table, record, callback)

[/name]

[category]

Category: Data

[/category]

[description]

[short_description]

Using App Lab's table data storage, deletes the record from the provided *table* with the matching *record* id, and calls the *callback* function when the action is finished. A boolean variable *success* is returned as a parameter to the callback function.

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
button("deleteButton", "Delete Most Recent Record");
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

onEvent("deleteButton", "click", function() {
  deleteRecord("fav_foods", {id:mostRecentID}, function(success) {
    if (success) {
      console.log("Record deleted with id:" + mostRecentID);
    }
    else {
      console.log("No record to delete with id:" + mostRecentID);
    }      
  });
});
```

[/example]

____________________________________________________

[example]

**Example: Delete New Driver** Delete a 16 year old's record.

```
// Delete a 16 year old's record.
textInput("nameInput", "What is your name?");
textInput("ageInput", "What is your age?");
textInput("foodInput", "What is your favorite food?");
button("submitButton", "Submit");
button("displayButton", "Delete a New Driver");

onEvent("submitButton", "click", function() {
  var favFoodData={};
  favFoodData.name = getText("nameInput");
  favFoodData.age = getNumber("ageInput");
  favFoodData.food = getText("foodInput");
  createRecord("fav_foods", favFoodData, function(record) {
    console.log("Record created with id:" + record.id);
    console.log("Name:" + record.name + " Age:" + record.age + " Food:" + record.food);
  });
});

onEvent("displayButton", "click", function() {
    var driverAge=16;  
    readRecords("fav_foods", {age:driverAge}, function(records) {
      if (records.length>0) {
        deleteRecord("fav_foods", {id:records[0].id}, function(success) {
          if (success) {
            console.log("Record deleted with id:" + records[0].id);
          }
          else {
            console.log("No record to delete with id:" + records[0].id);
          }
        });
      }
      else {
        console.log("No records to delete");
      }      
    });
});
```

[/example]

____________________________________________________

[example]

**Example: Search and Destroy** Search for a matching food record and delete it.

```
// Search for a matching food record and delete it.
textInput("nameInput", "What is your name?");
textInput("ageInput", "What is your age?");
textInput("foodInput", "What is your favorite food?");
button("submitButton", "Submit");

onEvent("submitButton", "click", function() {
  var favFoodData={};
  favFoodData.name = getText("nameInput");
  favFoodData.age = getNumber("ageInput");
  favFoodData.food = getText("foodInput");
  createRecord("fav_foods", favFoodData, function(record) {
    console.log("Record created with id:" + record.id);
    console.log("Name:" + record.name + " Age:" + record.age + " Food:" + record.food);
  });
});

textLabel("deleteLabel", "What food do you want to delete?");
textInput("deleteInput", "");
button("delete", "Delete");
onEvent("delete", "click", function() {
  var deleteQuery = getText("deleteInput");
  readRecords("fav_foods", {food:deleteQuery}, function(records) {
    if (records.length>0) {
      deleteRecord("fav_foods", {id:records[0].id}, function(success) {
        if (success) {
          console.log("Record deleted with id:" + records[0].id);
        }
        else {
          console.log("No record to delete with id:" + records[0].id);
        }
      });
    }
    else {
      console.log("No records to delete");
    }      
  });
});

```

[/example]

____________________________________________________

[syntax]

### Syntax

```
deleteRecord(table, record, function(success){
    //callback function code goes here
  });
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| table | string | Yes | The name of the table to delete a record from. |
| record | object | Yes | To identify the record to be deleted, the record needs to be provided in the record object format. Only the id field is mandatory to uniquely identify the record. Examples: {id:recordId}, {id:1}, {id:records[0].id}
| callback | function | Yes | A function that is asynchronously called when the call to deleteRecord() is finished. A boolean variable *success* is returned as a parameter to the callback function.|

[/parameters]

[returns]

### Returns
When *deleteRecord()* is finished executing, the callback function is automatically called and passed a boolean *success* parameter.

[/returns]

[tips]

### Tips
- *deleteRecord()* has a callback because it is accessing the remote data storage service and therefore will not finish immediately
- The callback function can be inline, or separately defined in your app and called from *deleteRecord()*.
- Do not put functions inside a loop that contain asynchronous code, like *deleteRecord()*. The loop will not wait for the callback function to complete.
- Use with [createRecord()](/applab/docs/createRecord), [readRecords()](/applab/docs/readRecords), and [updateRecord()](/applab/docs/updateRecord) records to create, read, and update records in a table.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
