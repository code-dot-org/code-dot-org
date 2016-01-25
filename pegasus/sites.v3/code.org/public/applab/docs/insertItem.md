---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## insertItem(list, index, item)

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Inserts the item into the array at the specified index position.

[/short_description]

In real life you sometimes need to add items at various positions in a list, and make the list larger. *insertItem(list, index, item)* makes the "list" one larger and inserts the "item" at the specified *index* position (moving other items to the right). The index must be a valid index position in the list or you may get unexpected results.

[/description]

### Examples
____________________________________________________

[example]

```
// List of favorite foods.
var myFavoriteFoods=["pizza","steak"];
console.log(myFavoriteFoods + " length=" +myFavoriteFoods.length);
insertItem(myFavoriteFoods, 1, "artichokes");
console.log(myFavoriteFoods + " length=" +myFavoriteFoods.length);
insertItem(myFavoriteFoods, 4, "shrimp");
console.log((myFavoriteFoods + " length=") +myFavoriteFoods.length);
```

[/example]

____________________________________________________

[example]

**Example: Fibonacci** Generate the first 10 numbers in the fibonacci sequence.

```
// Generate the first 10 numbers in the fibonacci sequence.
var fibonacci=[1,1];
var nextTerm=0;
for (var i=3; i<=10; i++) {
  nextTerm=fibonacci[i-2]+fibonacci[i-3];
  insertItem(fibonacci, i, nextTerm);
}
console.log(fibonacci);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
insertItem(list, index, item)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| list | variable name | Yes | The variable name of the list (array) you want to insert the item into. |
| index | number  | Yes | The index position you want to insert the item at. |
| item | any type  | Yes | The number or string item to be inserted into the list. |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]

### Tips
- List(array) manipulation functions include: [appendItem(list, item)](/applab/docs/appendItem), [insertItem(list, index, item)](/applab/docs/insertItem) and [removeItem(list, index)](/applab/docs/removeItem).
- Multiple calls to *insertItem()* can be slow because to expand the list, Javascript needs to create a new list one item larger and then copy all the items over before instering the new item at the end. If possible it is better to create the list intially large enough for all the possible items and *list[index]* to add new items at specific positions.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
