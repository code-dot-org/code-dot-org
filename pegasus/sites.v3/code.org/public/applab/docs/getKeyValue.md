---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## getKeyValue(key, callback)

[/name]


[category]

Category: Data

[/category]

[description]

[short_description]

Retrieves the value stored at the provided `key` name in App Lab's key/value data storage. The value is returned as a parameter to `callback` function when the retrieval is finished. Data is accessible to your app and users of your app.

[/short_description]

App Lab's remote key/value data storage enables persistent data storage for an app. Consider a variable that is declared in an app such as `var highscore = 10;`. 'highscore' will get recreated with a value of 10 every time the app loads. `getKeyValue` can be used with `setKeyValue` to retrieve the value of a stored variable in the cloud that the app can access across app refreshes. You can think of the `key` parameter as similar to the variable name (e.g. "highscore") and the `value` that is returned as similar to the variable value (e.g. 10). When the value is retrieved, the callback function is asynchronously called. Use with [setKeyValue()](/applab/docs/setKeyValue)

**Note:** View your app's key/value data by clicking 'View data' in App Lab and clicking 'View key/value pairs'

[/description]

### Examples
____________________________________________________

[example]

**How to access a key's value:** When calling `getKeyValue`, the callback function that is called when the remote data storage call finishes is passed the value as a parameter.


```
setKeyValue("highScore", 100 , function () { //Store "highScore": 100 in the app's key/value data storage
  console.log("highScore stored");

  //Get value of key 'highScore'. The value is passed as the parameter named 'value' in the inline function
  getKeyValue("highScore", function (value) {
    console.log("high score is: " + value); //Log "highScore", which will be 100.
  });

});
```

[/example]

____________________________________________________

[example]

**If the key doesn't exist:** When calling `getKeyValue` on a key that doesn't exist in storage, the value returned in the callback will be `undefined`


```
  //Get value of key 'testKey'. Since 'testKey' was never set, the value will be undefined
  getKeyValue("testKey", function (value) {
    if(value === undefined){ //Check if the value at key 'testKey' exists
      console.log("testKey doesn't exist");
    }
  });
```

[/example]

____________________________________________________

[example]

In this more detailed example, a random number between 1 and 100 is generated every time the app runs. The program checks whether the random number that was generated is bigger than the value stored in persistent key/value storage. If it is, then it updates the saved value. Try running this example multiple times and view the key/value data to see `biggestNumber` update.


```
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

```

[/example]

____________________________________________________

[syntax]

### Syntax

```
getKeyValue(key, function(value){
    //callback function code goes here
    //Parameter 'value' stores the value
  });
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| key | string | Yes | The name of the key to be retrieved.  |
| callback | function | yes | A function that is asynchronously called when the call to getKeyValue is finished. callback  is passed a single parameter that stores the value.  |

[/parameters]

[returns]

### Returns
When `getKeyValue` is finished executing, `callback` function is automatically called, passing `value` as a parameter. If `key` does not exist, `value` will be `undefined`.

[/returns]

[tips]

### Tips
- This function has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- Use with [setKeyValue()](/applab/docs/setKeyValue)

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
