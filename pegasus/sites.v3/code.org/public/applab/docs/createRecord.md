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

Using App Lab's table data storage, creates a record with a unique id in the table name provided, and calls the callback function when the action is finished. The record created is passed as a parameter to the callback function. Data is accessible to your app and users of your app.

[/short_description]

**First time using App Lab table data storage?** Read a short overview of what it is and how to use it [here](/applab/docs/tabledatastorage).

**Note:** View your app's table data by clicking 'View data' in App Lab and clicking the table name you want to view.

[/description]

### Examples
____________________________________________________

[example]

**Add a single record to a table** In a simple example, we want to add a row to a table
that is collecting data about people's favorite foods. From the app, we can add a row with values
 for the 3 columns named "name", "age", and "food". When the record is created in the table,
 it is automatically given a unique id. Click 'View Data' in App Lab to see the stored data.


```
createRecord("Fav Foods", {name:'Sally', age: 15, food:"avocado"}, function(record) {
  console.log("I'm executed after the record is done being created");
  console.log("Record id: " + record.id + " created!");
});

console.log("I'm executed right after the line above while the record is being created!");
```

[/example]

____________________________________________________

[example]

**Simple survey** In this example, the app asks the user for their name, age,
 and favorite food. When the submit button is pressed, the values from the 3 input fields are
  grabbed using [getText()](/applab/docs/getText) and the values are used to create a record in the table.
  Click 'View Data' in App Lab to see the stored data.


```
//Set up the input boxes and submit button
textInput("nameInput", "What is your name?");
textInput("ageInput", "What is your age?");
textInput("foodInput", "What is your favorite food?");
button("submitButton", "Submit");

//When the button is clicked, get the text from the 3 input boxes and create a record in the table
onEvent("submitButton", "click", function() {
  var userName = getText("nameInput");
  var userAge = getText("ageInput");
  var userFood = getText("foodInput");
  createRecord("fav_foods", {name:userName, age: userAge, food:userFood}, function(record) {
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
| table | string | Yes | The name of the table the record should be added to. `table` gets created if it doesn't exist.  |
| record | object | Yes | The data to be stored. Object syntax: An object begins with { (left brace) and ends with } (right brace). Each column name is followed by : (colon) and the name/value pairs are separated by , (comma). Values can be strings, numbers, arrays, or objects. e.g. {column1:"a string", column2:10, column3:[1,2,3,4]}.  |
| callback | function | No | A function that is asynchronously called when the call to createRecord() is finished. The created record object is passed as a parameter to the callback function. The unique ID of the new record can be accessed via record.id  |

[/parameters]

[returns]

### Returns
When `createRecord()` is finished executing, `callback` is automatically called and is passed the created record object as a parameter.

[/returns]

[tips]

### Tips
- This function has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- Use with [readRecords()](/applab/docs/readRecords), [deleteRecord()](/applab/docs/deleteRecord), and [updateRecord()](/applab/docs/updateRecord) records to view, delete, and update records in a table.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
