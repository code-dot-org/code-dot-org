---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## onRecordEvent(table, callback, *includeAll*)

[/name]

[category]

Category: Data

[/category]

[description]

[short_description]

Executes the *callback* function code when a create, update, or delete event occurs (remotely, for any reason) inside the specified table. In other words, *onRecordEvent* is a way for any and all instances of an app to be notified in real time if any changes to the underlying table are made.  The *eventType* (create, update, delete) is passed to the callback function.  By default, the event will only fire if it occurred while the app was running.  If *includeAll* is set to true, however, a create event will also fire for each record that is already in the table.  

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

**Example: Update chart** Updates chart whenever any record is added, updated, or deleted from the data table.  Assumes a table named foodVotes and a chart named votesChart already exists.  

```
// On any kind of change to the data table redraw the chart
onRecordEvent("foodVotes", function(record) {
   drawChartFromRecords("votesChart", "bar", "foodVotes", ["name", "count"]);
});
```

[/example]
____________________________________________________

[example]

**Example: Log events** Log any kind of event happening to the data table to the console by checking for the *eventType*.  Assumes a table named foodVotes already exists.

```
onRecordEvent("foodVotes", function(record, eventType) {
  if (eventType == 'create') {
    console.log('A record for the food ' + record.name + ' was created');
  } else if (eventType == 'update') {
    console.log('The record for the food ' + record.name + ' was updated');
  } else if (eventType == 'delete') {
    console.log('The record for the food ' + record.name + ' was deleted');
  } 
});
```

[/example]
____________________________________________________
[example]

**Example: Include all** Set the *includeAll* optional parameter to true to fire create events for existing records and print out info for records that have already been created.  Assumes a table named fav_foods already exists.

```
textLabel("heading", "Everyone's favorite foods:");
onRecordEvent("fav_foods", function(record, eventType) {
  if (eventType == 'create') {
     write(record.name + "'s favorite food is " + record.food + ".");
  }
}, true);
```

[/example]
____________________________________________________

[syntax]

### Syntax

```
onRecordEvent(table, function(record, eventType) {
  // code to execute
}, includeAll);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| table | string | Yes | The name of the table to which this event handler applies. |
| callback | function | Yes | The callback function executed in response to a create, update, or delete event in the specified table. |
| includeAll | boolean | No | Optional parameter that specifies whether a create event should also fire for each record that is already in the table. Defaults to false.|

<br>

| eventType  | Description                   |
|-------|-------------------------------|
| "create" | A record has been added to the specified table.  |
| "update" | A record has been updated in the specified table.  |
| "delete" | A record has been deleted in the specified table. |

[/parameters]

[returns]

### Returns
No return value, callback function executed.

[/returns]

[tips]

### Tips
- Don’t use multiple *onRecordEvent* functions to listen to the same table.  Otherwise you may hit a race condition and run into unexpected behavior.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
