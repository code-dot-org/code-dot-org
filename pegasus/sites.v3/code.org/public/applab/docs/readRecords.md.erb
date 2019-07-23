---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## readRecords(table, terms, callback)

[/name]

[category]

Category: Data

[/category]

[description]

[short_description]

Using App Lab's table data storage, reads the records from the provided *table* that match the *terms*, and calls the *callback* function when the action is finished. The records read from the table are then returned as a parameter to the callback function. 

[/short_description]

Adding permanent data storage to your apps is the last step to making them real-world. The apps you use everyday are driven by data "in the cloud".

**First time using App Lab table data storage?** Read a short overview of what it is and how to use it [here](/applab/docs/tabledatastorage).

You can request a subset of records to be returned using the terms parameter, which must be a javascript object variable or a javascript object defined using curly brace and colon notation (see examples below). Terms can be used to read records with exact matches to columns of a record. To retrieve all records, an empty object is passed as the *terms* parameter. Data is only accessible to the app that created the table. 

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
button("displayButton", "Display");

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
    readRecords("fav_foods", {}, function(records) {
        if (records.length>0) {
            for (var i =0; i < records.length; i++) {
              write("id: " + records[i].id + " Age:" + records[i].age + " Food: " + records[i].food);
            }
        }
        else {
              write("No records to read");
        }      
    });
});
  
```

[/example]

____________________________________________________

[example]

**New Drivers Only** Read a subset of records for 16 year olds only.

```
// Read a subset of records for 16 year olds only.
textInput("nameInput", "What is your name?");
textInput("ageInput", "What is your age?");
textInput("foodInput", "What is your favorite food?");
button("submitButton", "Submit");
button("displayButton", "Display New Drivers Only");

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
            for (var i =0; i < records.length; i++) {
              write("id: " + records[i].id + " Age:" + records[i].age + " Food: " + records[i].food);
            }
        }
        else {
              write("No records to read");
        }      
    });
});
```

[/example]

____________________________________________________

[example]

**Last in Line** Read the last record in the table.

```
// Read the last record in the table.
textInput("nameInput", "What is your name?");
textInput("ageInput", "What is your age?");
textInput("foodInput", "What is your favorite food?");
button("submitButton", "Submit");
button("displayButton", "Display Last In Line");

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
    readRecords("fav_foods", {}, function(records) {
        if (records.length>0) {
            var last=records.length-1;
            write("id: " + records[last].id + " Age:" + records[last].age + " Food: " + records[last].food);
        }
        else {
              write("No record to read");
        }      
    });
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
readRecords(table, terms, function(records){
    //callback function code goes here
  });
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| table | string | Yes | The name of the table to read records from. |
| terms | object | Yes | The object used to search the table. Either a javascript object variable or a javascript object defined using curly brace and colon notation (see examples above).
| callback | function | Yes | A function that is asynchronously called when the call to readRecords() is finished. An array of the matching records are returned as a single parameter to this function.|

[/parameters]

[returns]

### Returns
When *readRecords()* is finished executing, the callback function is automatically called and is returned an array of matching records (objects) as a parameter.

[/returns]

[tips]

### Tips
- The javascript object properties in *term* must match the App Lab table column names. Both are case sensitive.
- *readRecords()* has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- The callback function can be inline, or separately defined in your app and called from *readRecords()*.
- Do not put functions inside a loop that contain asynchronous code, like *readRecords()*. The loop will not wait for the callback function to complete.
- Use with [createRecord()](/applab/docs/createRecord), [deleteRecord()](/applab/docs/deleteRecord), and [updateRecord()](/applab/docs/updateRecord) records to create, delete, and update records in a table.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
