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

Using App Lab's table data storage, reads the records from the provided `table` that match the `terms`. When the call is completed, the `callback` function is called and is passed the array of records. Data is accessible to your app and users of your app.

[/short_description]

**First time using App Lab table data storage?** Read a short overview of what it is and how to use it [here](/applab/docs/tabledatastorage).
**Note:** View your app's table data by clicking 'View data' in App Lab and clicking the table name you want to view.

[/description]

### Examples
____________________________________________________

[example]

**Read all records from a table** After creating a record in the table, we can read all records back from the table and display the column values to the screen. To retrieve all records, an empty object is passed as the `terms` parameter. Click 'View Data' in App Lab to see the stored data.


```
//Create a single record in the table
createRecord("fav_foods", {name:"Sally", age:16, food:"avocado"}, function() {

  //After the record is created, get all the records back from the table
  readRecords("fav_foods", {}, function(records) {
    for (var i =0; i < records.length; i++) {
      write("id: " + records[i].id + " Age:" + records[i].age + " Food: " + records[i].food);
    }
  });

});

```

[/example]

____________________________________________________

[example]

**Search for records** Similar the example above, we can request a subset of records to be returned using the `terms` parameter. `terms` can be used to find exact matches on one or more columns of a record. Click 'View Data' in App Lab to see the stored data.


```
//Create a single record in the table
createRecord("fav_foods", {name:"Sally", age:16, food:"avocado"}, function() {

  //After the record is created, search for records where the food column exactly matches "avocado".
  readRecords("fav_foods", {food:"avocado"}, function(records) {
    for (var i =0; i < records.length; i++) {
      write("id: " + records[i].id + " Age:" + records[i].age + " Food: " + records[i].food);
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
| table | string | Yes | The name of the table from which the records should be searched and read. |
| terms | object | Yes | To read all records from a table, use the empty terms object {}. To search for a particular set of records, use the object syntax to specify values for one or more column values to match. Examples: {id: 1}, {food:"avocado"}, {name:"Sally", food:"ravioli"}
| callback | function | Yes | A function that is asynchronously called when the call to readRecords() is finished. An array of the matching records are passed as a single parameter to this function.|

[/parameters]

[returns]

### Returns
No return value. When `readRecords()` is finished executing, `callback` function is automatically called.

[/returns]

[tips]

### Tips
- This function has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- Use with [createRecord()](/applab/docs/createRecord), [deleteRecord()](/applab/docs/deleteRecord), and [updateRecord()](/applab/docs/updateRecord) records to view, delete, and update records in a table.
- [Learn more](/applab/docs/tabledatastorage) about App Lab table data storage

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
