---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## createRecord(table, record, callback)

[/name]

[category]

Category: Data

[/category]

[description]

[short_description]

Using App Lab's table data storage, creates a *record* with a unique id in the *table* name provided, and calls the *callback* function when the action is finished.

[/short_description]

Adding permanent data storage to your apps is the last step to making them real-world. The apps you use everyday are driven by data "in the cloud".

**First time using App Lab table data storage?** Read a short overview of what it is and how to use it [here](/applab/docs/tabledatastorage).

The *record* parameter must be a javascript object variable or a javascript object defined using curly brace and colon notation (see examples below). The object cannot have an "id" property. The record created in the table is then returned as a parameter to the callback function. Data is only accessible to the app that created the table. To View your app's table data, click 'View data' in App Lab and click the table name you want to view.

[/description]

### Examples
____________________________________________________

[example]

```
createRecord("Fav Foods", {name:'Sally', age: 15, food:"avocado"}, function(record) {
  console.log("I'm executed after the record has been created.");
  console.log("Record id: " + record.id + " created!");
});
console.log("I'm executed right after createRecord is called while the record is being created.");
```

[/example]

____________________________________________________

[example]

**Example: Simple Survey**  Collect favorite food data from friends and store it in a table.

```
// Collect favorite food data from friends and store it in a table.
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

```

[/example]

____________________________________________________

[syntax]

### Syntax

```
createRecord(table, record, function(record){
    //callback function code goes here
  });
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| table | string | Yes | The name of the table the record should be added to. A new table gets created if it doesn't exist.  |
| record | object | Yes | The data to be stored in the record. Either a javascript object variable or a javascript object defined using curly brace and colon notation (see examples above). |
| callback | function | No | The callback function that is asynchronously called when the call to createRecord() is finished. The created record object is returned as a parameter to the callback function. The unique ID of the new record can be accessed via record.id |

[/parameters]

[returns]

### Returns
When *createRecord()* is finished executing, the callback function is automatically called and the created record object is returned as a parameter.

[/returns]

[tips]

### Tips

- The javascript object properties must match the App Lab table column names. Both are case sensitive.
- Duplicate records are allowed in a table but will have different id values assigned automatically.
- *createRecord()* has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- The callback function can be inline, or separately defined in your app and called from *createRecord()*.
- Do not put functions inside a loop that contain asynchronous code, like *createRecord()*. The loop will not wait for the callback function to complete.
- Use with [readRecords()](/applab/docs/readRecords), [deleteRecord()](/applab/docs/deleteRecord), and [updateRecord()](/applab/docs/updateRecord) records to view, delete, and update records in a table.

[/tips]

[advanced]
### Advanced


*createRecord()* has an additional optional callback function that gets called only if an error occurs when trying to create a record.  For example, when the maximum number of rows in a table is reached, the error callback will be called. 

**Example: Simple survey** Collect favorite food data from friends and store it in a table.  Let user know if their answers couldn’t be logged.

```
// Collect favorite food data from friends and store it in a table.
textInput("nameInput", "What is your name?");
textInput("ageInput", "What is your age?");
textInput("foodInput", "What is your favorite food?");
button("submit", "Submit");

onEvent("submit", "click", function() {
  var favFoodData={};
  favFoodData.name = getText("nameInput");
  favFoodData.age = getNumber("ageInput");
  favFoodData.food = getText("foodInput");
  createRecord("fav_foods", favFoodData, function(record) {
    textLabel("outputText", "Thanks!  Your responses got recorded.");
  }, function (error, status) {
    // Status code 403 means that the table has already reached its capacity.
    if (status == 403) {
      textLabel("outputText", "Sorry, it looks like our table is full.");
    } else {
      textLabel("outputText", "There was an error and we couldn't record your responses.");
    }
  }); 
});
```

**Syntax:**

```
createRecord(table, record, function(record){
    //onSuccess callback function code goes here
  }, function(error, status) {
    //onError callback function code goes here
});
```
[/advanced]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>

