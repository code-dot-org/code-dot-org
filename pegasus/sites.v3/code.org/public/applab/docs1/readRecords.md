---
title: App Lab Docs
---

[name]

## readRecords(tableName, searchTerms, callbackFunction)

[/name]


[category]

Category: Data

[/category]

[description]

[short_description]

Using App Lab's table data storage, reads the records from the provided `tableName` that match the `searchTerms`. When the call is completed, the `callbackFunction` is called and is passed the array of records. Data is accessible to your app and users of your app.

[/short_description]

**About App Lab's table data storage:**  
App Lab's table data storage enables persistent data storage
 for an app. Whereas [setKeyValue()](/applab/docs/getKeyValue) and [getKeyValue()](/applab/docs/getKeyValue) can be used to store multiple independent key/value pairs, table data storage allows you to store similar data together in a table format.

 As a simple example, let's say you are building an app that
  collects information about a person's name,
   age, and favorite food so you can figure out if food
    preferences are correlated with age.

If you were storing this data on a piece of paper, or with a spreadsheet app, you might format the data like this:

| Name  | Age | Food
|-----------------|------|-----------|
| Abby  | 17 | Ravioli |
| Kamara  | 15 | Sushi |
| Rachel  | 16 | Salad |
<br>
The table has a row of column names, and then each row that is added to the table fills in one or more
 of the columns. App Lab's table data storage let you store similarly formatted data, and provides simple
  functions to [read](/applab/docs/readRecords), [create](/applab/docs/createRecords), [delete](/applab/docs/deleteRecord), and [update](/applab/docs/updateRecord) records (rows) in a table, right from your app.

_Definitions:_  
_Table:_ A collection of records with shared column names  
_Record:_ A "row" of the table  


**Note:** View your app's table data by clicking 'View data' in App Lab and clicking the table name you want to view.

[/description]

### Examples
____________________________________________________

[example]

**Read all records from a table** Continuing the example above, after creating a record in the table, we can read all records back from the table and display the column values to the screen. Click 'View Data' in App Lab to see the stored data.

<pre>
//Create a single record in the table
createRecord("fav_foods", {name:"Sally", age:16, food:"avocado"}, function() {

  //After the record is created, get all the records back from the table
  readRecords("fav_foods", {}, function(records) {
    for (var i =0; i < records.length; i++) {
      write("id: " + records[i].id + " Age:" + records[i].age + " Food: " + records[i].food);
    }
  });

});

</pre>

[/example]

____________________________________________________

[example]

**Search for records** Similar the example above, we can request a subset of records to be returned using the `searchTerms` parameter. Click 'View Data' in App Lab to see the stored data.

<pre>
//Create a single record in the table
createRecord("fav_foods", {name:"Sally", age:16, food:"avocado"}, function() {

  //After the record is created, search for records where the food matches "avocado".
  readRecords("fav_foods", {food:"avocado"}, function(records) {
    for (var i =0; i < records.length; i++) {
      write("id: " + records[i].id + " Age:" + records[i].age + " Food: " + records[i].food);
    }
  });

});

</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
createRecord(tableName, record, function(){
    //callback function code goes here
  });
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| tableName | string | Yes | The name of the table the record should be added to. `tableName` gets created if it doesn't exist.  |
| record | object | Yes | The data to be stored. Object syntax: An object begins with { (left brace) and ends with } (right brace). Each column name is followed by : (colon) and the name/value pairs are separated by , (comma). Values can be strings, numbers, arrays, or objects. e.g. {column1:"a string", column2:10, column3:[1,2,3,4]}.  |
| callbackFunction | function | No | A function that is asynchronously called when the call to createRecord() is finished.  |

[/parameters]

[returns]

### Returns
When `createRecord()` is finished executing, `callbackFunction` is automatically called.

[/returns]

[tips]

### Tips
- This function has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- Use with [readRecords()](/applab/docs/readRecords), [deleteRecord()](/applab/docs/deleteRecord), and [updateRecord()](/applab/docs/updateRecord) records to view, delete, and update records in a table.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
