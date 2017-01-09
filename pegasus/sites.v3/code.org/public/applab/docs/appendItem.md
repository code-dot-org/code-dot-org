---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## appendItem(list, item)

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Appends the item to the end of the array.

[/short_description]

In real life you sometimes need add items to the end of the list, and make the list larger. *appendItem(list, item)* makes the "list" one larger and inserts the "item" at the end of the list. If the append is successful, *appendItem()* returns true, otherwise it returns false.

[/description]

### Examples
____________________________________________________

[example]

```
// List of favorite movies.
var myFavoriteMovies=[];
appendItem(myFavoriteMovies, "Star Wars");
appendItem(myFavoriteMovies, "Lord of the Rings");
appendItem(myFavoriteMovies, "Harry Potter");
console.log(myFavoriteMovies);
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
  appendItem(fibonacci,nextTerm);
}
console.log(fibonacci);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
appendItem(list, item)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| list | variable name | Yes | The variable name of the list (array) you want to append to the end of. |
| item | any type  | Yes | The number or string item to be inserted at the end of the list. |

[/parameters]

[returns]

### Returns
Boolean true or false

[/returns]

[tips]

### Tips
- List(array) manipulation functions include: [appendItem(list, item)](/applab/docs/appendItem), [insertItem(list, index, item)](/applab/docs/insertItem) and [removeItem(list, index)](/applab/docs/removeItem).
- Multiple calls to *appendItem()* can be slow because to expand the list, Javascript needs to create a new list one item larger and then copy all the items over before instering the new item at the end. If possible it is better to create the list intially large enough for all the possible items and *list[index]* to add new items at specific positions.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
