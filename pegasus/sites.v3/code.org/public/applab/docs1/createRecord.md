---
title: App Lab Docs
---

[name]

## createRecord(tableName, record, callbackFunction)

[/name]


[category]

Category: Data

[/category]

[description]

[short_description]

Creates a record in the table name provided, and calls the callbackFunction when the action is finished. Data is accessible to your app and users of your app.

[/short_description]

Consider a simple table that you might make with pen and paper, or with a spreadsheet app. The table has a list of column names, and then each row that is added to the table fills in one or more of the columns. For example:

| Name  | Age | Favorite food
|-----------------|------|-----------|
| Abby  | 17 | Ravioli |
| Kamara  | 15 | Sushi |
| Rachel  | 16 | Salad |

Tables in App Lab Data Storage can be represented visually the same way, and there are simple functions to let you read, create, delete, and update rows (called records), right from your app.

_Definitions:_  
**Table:** A collection of records with shared column names  
**Record:** A "row" of the table  

App Lab's table data storage enables persistent data storage for an app. Continuing our example, let's say you wanted to build an app that collects information about a person's name, age, and favorite food so you can figure out if food preferences are correlated with age. If that data is just stored locally in an array in the app, then it will not exist when the app is refreshed. There would also not be a central location where the data across users could be collected and analyzed. By storing this data with App Lab's table data storage, the data can be collected, viewed, and analyzed.

**Note:** View your app's table data by clicking 'View data' in App Lab and clicking the table name you want to view.

[/description]

### Examples
____________________________________________________

[example]

<pre>
//Stores "highScore": 100 in the app's key/value data storage
setKeyValue('highScore', 100, function(){     console.log("I execute asynchronously when key/value is stored.  Click View Data to see the data.");
});
console.log("I execute immediately after");
</pre>

[/example]

____________________________________________________

[example]

<pre>
setKeyValue("highScore", 100 , function () { //Store "highScore": 100 in the app's key/value data storage
  console.log("highScore stored");

  getKeyValue("highScore", function (value) { //When the data is successfully stored, fetch it again
    console.log("high score is: " + value); //Log "highScore", which will be 100.
  });

});
</pre>

[/example]

____________________________________________________

[example]

In this more detailed example, a random number between 1 and 100 is generated every time the app runs. The program checks whether the random number that was generated is bigger than the value stored in persistent key/value storage. If it is, then it updates the saved value. Try running this example multiple times and view the key/value data to see `biggestNumber` update.

<pre>
var random = randomNumber(1, 100); //Generate a random number
/*Get current value of "biggestNum". The data comes back asynchronously and is stored in 'value' */
getKeyValue("biggestNum", function (value) {
  console.log("random: " + random + " biggestNumber: " + value);
  if ((value === undefined) || (random > value)) { //Check if 'value' is undefined or smaller than random
    setKeyValue("biggestNum", random, function () { //If so, update 'biggestNum' to 'random'
      console.log(random + " is bigger than " + value + ". Updated biggestNumber");
    });
  }
});

</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
setKeyValue(key, value, function(){
    //callback function code goes here
  });
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| key | string | Yes | The name of the key to be stored.  |
| value | string, number, array, or object | Yes | The data to be stored.  |
| callbackFunction | function | No | A function that is asynchronously called when the call to setKeyValue is finished.  |

[/parameters]

[returns]

### Returns
When `setKeyValue` is finished executing, `callbackFunction` is automatically called.

[/returns]

[tips]

### Tips
- This function has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- Use with [getKeyValue()](/applab/docs/getKeyValue)

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
