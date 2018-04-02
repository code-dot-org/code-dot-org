---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## removeItem(list, index)

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Removes the item from the array at the specified index position.

[/short_description]

In real life you sometimes need to remove items at various positions in a list, and make the list smaller. *removeItem(list, index)* makes the "list" one smaller by removing the item at the specified *index* position (moving other items to the left). The index must be a valid index position in the list or you may get unexpected results.

[/description]

### Examples
____________________________________________________

[example]

```
// List of favorite foods.
var myFavoriteFoods=["pizza", "artichokes", "steak", "shrimp"];
console.log(myFavoriteFoods + " length=" +myFavoriteFoods.length);
removeItem(myFavoriteFoods, 1);
console.log(myFavoriteFoods + " length=" +myFavoriteFoods.length);
removeItem(myFavoriteFoods, 1);
console.log((myFavoriteFoods + " length=") +myFavoriteFoods.length);
```

[/example]

____________________________________________________

[example]

**Example: Queue Up** Use a list to simulate a queue, removing people from the front of the list and adding people to the rear.

```
// Use a list to simulate a queue, removing people from the front of the list and adding people to the rear.
var myQueue=["John", "Mary", "Susan", "Michael"];
console.log(myQueue);
removeItem(myQueue, 0);
removeItem(myQueue, 0);
console.log(myQueue);
appendItem(myQueue, "Martha");
console.log(myQueue);
removeItem(myQueue, 0);
console.log(myQueue);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
removeItem(list, index)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| list | variable name | Yes | The variable name of the list (array) you want to remove an item from. |
| index | number  | Yes | The index position you want to remove the item from. |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]

### Tips
- List(array) manipulation functions include: [appendItem(list, item)](/applab/docs/appendItem), [insertItem(list, index, item)](/applab/docs/insertItem) and [removeItem(list, index)](/applab/docs/removeItem).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
