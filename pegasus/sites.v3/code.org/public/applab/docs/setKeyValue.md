---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setKeyValue(key, value, callback)

[/name]

[category]

Category: Data

[/category]

[description]

[short_description]

Stores a key/value pair in App Lab's key/value data storage, and calls the callback function when the action is finished.

[/short_description]

App Lab's remote key/value data storage enables persistent data storage for an app. Consider a variable that is declared in an app such as *var highscore = 10;*. *highscore* will get recreated with a value of 10 every time the app loads. *setKeyValue* can be used to essentially store or update a variable in the cloud that the app can access across app restarts, or multiple people using the app on different devices. You can think of the *key* parameter as similar to the variable name (e.g. "highscore") and the *value* parameter as similar to the variable value (e.g. 10). When the key/value pair is saved, the callback function is asynchronously called. Use with [getKeyValue()](/applab/docs/getKeyValue).

Data is only accessible to the app that created the table. To View your app's data, click 'View data' in App Lab and click "view key/value pairs".

[/description]

### Examples
____________________________________________________

[example]

```
setKeyValue('highScore', 100, function(){
  console.log("I execute asynchronously when key/value is stored.  Click View Data to see the data.");
});
console.log("I execute immediately after");
```

[/example]

____________________________________________________

[example]

```
setKeyValue("highScore", 100 , function () {
  console.log("highScore stored");
  getKeyValue("highScore", function (value) {
    console.log("high score is: " + value);
  });
});
```

[/example]

____________________________________________________

[example]

**Example: Save the Bigger** Checks whether the random number that was generated is bigger than the value stored in persistent key/value storage. If it is, then it updates the saved value.

```
// Checks whether the random number that was generated is bigger than the value stored in persistent key/value storage. If it is, then it updates the saved value.
var random = randomNumber(1, 100);
getKeyValue("biggestNum", function (value) {
  console.log("random: " + random + " biggestNumber: " + value);
  if ((value === undefined) || (random > value)) {
    setKeyValue("biggestNum", random, function () {
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
setKeyValue(key, value, function(){
    //callback function code goes here
  });
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| key | string | Yes | The name of the key to be stored.  |
| value | string, number, array, or object | Yes | The data to be stored.  |
| callback | function | No | A function that is asynchronously called when the call to setKeyValue is finished.  |

[/parameters]

[returns]

### Returns
When setKeyValue() is finished executing, the callback function is automatically called.

[/returns]

[tips]

### Tips
- setKeyValue() has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- The callback function can be inline, or separately defined in your app and called from setKeyValue().
- Do not put functions inside a loop that contain asynchronous code, like setKeyValue(). The loop will not wait for the callback function to complete.
- Use with [getKeyValue()](/applab/docs/getKeyValue)

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
