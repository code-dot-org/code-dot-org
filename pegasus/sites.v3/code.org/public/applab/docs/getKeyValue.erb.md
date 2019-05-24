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

Retrieves the value stored at the provided *key* name in App Lab's key/value data storage. The value is returned as a parameter to *callback* function when the retrieval is finished.

[/short_description]

App Lab's remote key/value data storage enables persistent data storage for an app. Consider a variable that is declared in an app such as *var highscore = 10;*. *highscore* will get recreated with a value of 10 every time the app loads. *getKeyValue()* can be used with *setKeyValue()* to retrieve the value of a stored variable in the cloud that the app can access across app restarts, or multiple people using the app on different devices. You can think of the *key* parameter as similar to the variable name (e.g. "highscore") and the *value* that is returned as similar to the variable value (e.g. 10). When the value is retrieved, the callback function is asynchronously called. Use with [setKeyValue()](/applab/docs/setKeyValue)

Data is only accessible to the app that created the table. To View your app's data, click 'View data' in App Lab and click "view key/value pairs".

[/description]

### Examples
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
| callback | function | yes | A function that is asynchronously called when the call to getKeyValue is finished. callback is passed a single parameter that stores the value. |

[/parameters]

[returns]

### Returns
When getKeyValue() is finished executing, the callback function is automatically called, passing value as a parameter.

[/returns]

[tips]

### Tips
- If *key* does not exist, *value* will be undefined.
- getKeyValue() has a callback because it is accessing the remote data storage service and therefore will not finish immediately.
- The callback function can be inline, or separately defined in your app and called from getKeyValue().
- Do not put functions inside a loop that contain asynchronous code, like getKeyValue(). The loop will not wait for the callback function to complete.
- Use with [setKeyValue()](/applab/docs/setKeyValue)

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
