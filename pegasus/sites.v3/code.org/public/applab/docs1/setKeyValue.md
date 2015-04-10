---
title: App Lab Docs
---

[name]

## setKeyValue(key, value, callbackFunction)

[/name]


[category]

Category: Data

[/category]

[description]

[short_description]

Stores a key/value pair in App Lab's remote data storage, and calls the callbackFunction when the action is finished. Data is accessible to your app and users of your app.

[/short_description]

App Lab's remote key/value data storage enables persistent data storage for an app. Consider a variable that is declared in an app such as `var highscore = 10;`. 'highscore' will get recreated with a value of 10 every time the app loads. `setKeyValue` can be used to essentially store or update a variable in the cloud that the app can access across app refreshes. You can think of the `key` parameter as similar to the variable name (e.g. "highscore") and the `value` parameter as similar to the variable value (e.g. 10). When the key/value pair is saved, the callbackFunction is asynchronously called. Use with [getKeyValue()](/applab/docs/getKeyValue).

**Note:** View your app's key/value data by clicking 'View data' in App Lab and clicking 'View key/value pairs'

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
