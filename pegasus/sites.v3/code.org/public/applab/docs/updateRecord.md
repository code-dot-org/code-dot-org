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

Using App Lab's table data storage, updates the provided `record` in `table`. `record` must be uniquely identified with its id field. When the call is completed, the `callback` function is called, and is passed the updated record as a parameter. Data is accessible to your app and users of your app.

[/short_description]

**First time using App Lab table data storage?** Read a short overview of what it is and how to use it [here](/applab/docs/tabledatastorage).
**Note:** View your app's table data by clicking 'View data' in App Lab and clicking the table name you want to view.

[/description]

### Examples
____________________________________________________

[example]

**Create and then update a record** In this example, a record is created in a table named 'update_example1' when the 'Create Record' button is clicked. We assume that since it's the only record in the table, that the id is 1, and use that to update the record to have a different favorite food when the 'Update record' button is clicked. First try clicking 'Create Record', and then viewing the data in the data browser. Then, click 'Update Record' and refresh the data in the data browser.


```
//When 'Create' is clicked, add a new record to the table and write a confirmation to the display
button("createButton", "1. Create record");
onEvent("createButton", "click", function(event) {
  createRecord("update_example1", {name:'Alice', age:19, food:"salad"}, function(record) {
    write("Record created! Favorite food is " + record.food + ". View data to see the record");
  });
});

//When 'Update' is clicked, update the record with id:1 from the table and write to the display
button("updateButton", "2. Update record");
onEvent("updateButton", "click", function(event) {
  updateRecord("update_example1", {id:1, name: 'Alice', age:19, food:'bananas'}, function(record) {
    write("Record updated! Food is now " + record.food + ". Refresh the data to see the update!");
  });
});

```

[/example]

____________________________________________________

[example]

**One of these fruits is not like the others** In this more detailed example, we immediately loop
through an array of fruits and add them as records to the `update_example2` table. Only one of the
fruits is not like the others! We have a 'Find & Replace' button that when clicked, uses `readRecords`
to find all rows where the food is "sushi" and replaces the food name with "pineapples." After all
4 records have been created, view the records in the data browser. Then, click 'Find & Replace' and
refresh the data browser to see the updates.


```
/*
When the app loads, create 4 records in the table
*/
var fruit = ["sushi", "apples", "oranges", "bananas"]

for(var i = 0; i < fruit.length; i++){
  createRecord("update_example2", {food: fruit[i]}, function(record) {
    write("Created: Id:" + record.id + " food:" + record.food + " View data to see the record");
  });
}

/*
Create a button that when clicked, calls the helper function updateSushi (defined below)
*/
button("findReplace", "Find & Replace Sushi");
onEvent("findReplace", "click", function(event) {
  updateSushi();
});

/*
updateSushi uses read records to find all records where the food column matches the
string "sushi". For each of the records returned in the records array, an updated
record object is created using the current record's id, and updating the food column
value to be "pineapples"
*/
function updateSushi() {
  readRecords("update_example2", {food:"sushi"}, function(records) {
    for (var i =0; i < records.length; i++) {
      var updatedRecord = records[i];
      updatedRecord.food = "pineapples";
      updateRecord("update_example2", updatedRecord, function(record) {
        write("Record updated! Refresh the data to see that sushi is replaced with pineapples");
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
updateRecord(table, record, function(record){
    //callback function code goes here
  });
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| table | string | Yes | The name of the table from which the records should be searched and read. |
| record | object | Yes | To identify the record to be updated, a record object with the unique id column needs to be provided. Object syntax: An object begins with { (left brace) and ends with } (right brace). Each column name is followed by : (colon) and the name/value pairs are separated by , (comma). Values can be strings, numbers, arrays, or objects. e.g. {id: 1, column1:"a string", column2:10, column3:[1,2,3,4]} |
| callback | function | Yes | A function that is asynchronously called when the call to updateRecord() is finished. The updated record is passed as a single parameter to this function. |

[/parameters]

[returns]

### Returns
No return value. When `updateRecord()` is finished executing, `callback` function is automatically called with the updated record passed as a parameter.

[/returns]

[tips]

### Tips
- This function has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- Use with [createRecord()](/applab/docs/createRecord), [readRecords()](/applab/docs/readRecords), and [deleteRecord()](/applab/docs/updateRecord) records to create, read, and delete records in a table.
- [Learn more](/applab/docs/tabledatastorage) about App Lab table data storage

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
