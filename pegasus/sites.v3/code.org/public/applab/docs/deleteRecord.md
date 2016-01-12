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
  favFoodData.age = getText("ageInput");
  favFoodData.food = getText("foodInput");
  createRecord("fav_foods", favFoodData, function(record) {
    mostRecentID=record.id;
    console.log("Record created with id:" + record.id);
    console.log("Name:" + record.name + " Age:" + record.age + " Food:" + record.food);
  });
});

onEvent("deleteButton", "click", function() {
  deleteRecord("mytable", {id:mostRecentID}, function(success) {
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

**Search for matching records and delete them** In this more detailed example, we set up two text input boxes each with submit buttons.
The first lets you add your favorite foods to the table `food_survey`. Add multiple items, including some duplicates, and use the
data browser to view your data. Then, using the second text input, you can search for foods to delete. `readRecords` is used to
search for records matching the search query, and finally `deleteRecord` is called on each record that is returned in the records
results array.


```
/*
When the submit button is clicked, get the food from the text input and store it as a record
*/
textLabel("foodLabel", "What's your favorite food?", "foodInput");
textInput("foodInput", "");
button("submit", "Submit");
onEvent("submit", "click", function() {
  var response = getText("foodInput");
  createRecord("food_survey", {food:response}, function() {
    write("Record created! View data to see the record");
  });
});

/*
When the delete button is clicked, call the deleteItems helper function (defined below)
*/
textLabel("deleteLabel", "What food do you want to delete?", "deleteInput");
textInput("deleteInput", "");
button("delete", "Delete");
onEvent("delete", "click", function() {
  deleteItems();
});

/*
Define a function that gets the text from the deleteInput text input, and uses that as the
`searchTerm` in readRecords to find all matching records. For each record in the array that
is returned, get the id and delete it
*/
function deleteItems() {
  var deleteQuery = getText("deleteInput");
  readRecords("food_survey", {food:deleteQuery}, function(records) {
    for (var i =0; i < records.length; i++) {
      deleteRecord("food_survey", {id:records[i].id}, function() {
        write("Record deleted! Refresh the data to see that the record doesn't exist");
      });
    }
  });
}

```

[/example]

____________________________________________________

[syntax]

### Syntax

```
deleteRecord(table, recordId, function(){
    //callback function code goes here
  });
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| table | string | Yes | The name of the table from which the records should be searched and read. |
| record | object | Yes | To identify the record to be deleted, the record needs to be provided in the record object format. Only the id field is mandatory to uniquely identify the record. Examples: {id:recordId}, {id:1}, {id:records[0].id}
| callback | function | Yes | A function that is asynchronously called when the call to deleteRecord() is finished.|

[/parameters]

[returns]

### Returns
No return value. When `deleteRecord()` is finished executing, `callbackFunction` is automatically called.

[/returns]

[tips]

### Tips
- This function has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- Use with [createRecord()](/applab/docs/createRecord), [readRecords()](/applab/docs/readRecords), and [updateRecord()](/applab/docs/updateRecord) records to create, read, and update records in a table.
- [Learn more](/applab/docs/tabledatastorage) about App Lab table data storage

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
