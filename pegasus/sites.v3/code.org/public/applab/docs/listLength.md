---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## [list].length

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Returns the length of the array.

[/short_description]

Since our collections of data may change while the app is running, we might need to know how many items are currently in a list (array). *length* will tell us how big the array is. Even if some of the elements in the array are empty strings or zero, they are counted by *length*. 

In addition to the array variable name, items in your array are numbered with an index. The first element in an array is has index 0 and the second had index 1 and so on. As a result the last index is always one less than the length of the array.

[/description]

### Examples
____________________________________________________

[example]

```
var coinFaces = ["heads","tails"];
var coinValues = [1,5,10,25];
console.log(coinFaces.length);
console.log(coinValues.length);
```

[/example]

____________________________________________________

[example]

**Example: Pick a Day** Pick a random weekday and the last weekday.

```
// Pick a random weekday and the last weekday.
var weekDays = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
var randomDayIndex=randomNumber(0,weekDays.length-1);
var lastDayIndex=weekDays.length-1;
console.log("Random weekday is " + weekDays[randomDayIndex]);
console.log("Last weekday is " + weekDays[lastDayIndex]);
```

[/example]

____________________________________________________

[example]

**Example: Make Change** Find the minimum number of coins to make change.

```
// Find the minimum number of coins to make change.
var coinValues = [1,5,10,25];
var coinCounts = [0,0,0,0];
var changeAmount = promptNum("How much change must I give you?");
while (changeAmount>0) {
  for (var i=coinValues.length-1; i>=0; i--) {
    var currentCoin=coinValues[i];
    while (changeAmount>=currentCoin) {
      changeAmount=changeAmount-currentCoin;
      coinCounts[i]++;
    }
  }
}
console.log(coinCounts);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
[list].length
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| list | variable name | Yes | The variable name of the list (array) you want to know the length of. |

[/parameters]

[returns]

### Returns
The whole number length of the list (array).

[/returns]

[tips]

### Tips
- Off-by-one errors are very common when referencing array elements. Always pay attention to making sure you start at zero and end one less than the length of the array.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
