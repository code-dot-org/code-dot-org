---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## App Lab Table Data Storage

[/name]


### Overview
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
  functions to [read](/applab/docs/readRecords), [create](/applab/docs/createRecord), [delete](/applab/docs/deleteRecord), and [update](/applab/docs/updateRecord) records (rows) in a table, right from your app.

### Definitions
_Table:_ A collection of records with shared column names
_Record:_ A "row" of the table
_Persistent data storage:_ Data that is stored "in the cloud" separately from the code running in your app. The data can be accessed across multiple app refreshes or users of the app.

### Viewing Data
 View your app's table data by clicking 'View data' in App Lab and clicking the table name you want to view.

### Reading and creating table records from your app
To create, read, update, and delete table records from your app, use the following App Lab Data functions:

- To create a row in a table: [createRecord](/applab/docs/createRecord)
- To read one or multiple rows in a table: [readRecords](/applab/docs/readRecords)
- To update an existing row in a table: [updateRecord](/applab/docs/updateRecord)
- To delete an existing row from a table: [deleteRecord](/applab/docs/deleteRecord)

### Bulk importing table data from a file
If you have existing data in a spreadsheet that you want your app to be able to access, you can use the Import feature to quickly fill a table with records from the spreadsheet. To import data:

_Step 1._ **Format the spreadsheet**
In a spreadsheet editor of your choice, make sure the data is formatted with column names in the first row, and your table data below that. Your spreadsheet data should be formatted like this, but with values of your choosing (like our favorite food example):

| column 1  | column 2 | ... column N
|-----------------|------|-----------|
| row1 col1 data   | row1 col2 data | row1 colN data |
| row2 col1 data   | row2 col2 data | row2 colN data |
| row3 col1 data   | row3 col2 data | row3 colN data |
<br>

_Step 2._ **Save the spreadsheet as a csv file**
A comma separated file, or csv file, is a simple file format that most spreadsheet editors should support saving your file as. Save the file as a csv, and download it to your computer.

_Step 3._ **Import the file to App Lab table data storage**
To import the file into a table in App Lab:

1. Click the 'View data' button in App Lab while viewing your code in "Code mode."
2. Click an existing table name or add a new table to your app.
3. Click the Import button and select the csv file from Step 2.
4. Click 'Overwrite & Import' to have the spreadsheet data overwrite the current table data.
**Note:** Existing data _will_ be overwritten, so make sure you didn't intend to keep the current data!

_Step 4._ **Review the imported data**
If your data is imported successfully, then review the table to make sure everything looks right. You can make quick tweaks to rows
by clicking the "Edit" button for that row and editing the values inline.

If the data failed
to import properly, make sure that your original csv file was formatted properly with column names and valid rows.


Now that you have data in your table, you can use the App Lab Data functions linked above to read, update, delete, or create new rows in
your table.

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
