---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## getUserId()

[/name]

[category]

Category: Data

[/category]

[description]

[short_description]

Gets a unique identifier for the current user of this app.

[/short_description]

Sometimes you want to track a user over multiple uses of your app. *getUserId* will get a unique identifier that you can save to track this user's use of your app. Usually you will save the user ID to remote data storage using *createRecord()* so you can keep track of who gave you what data.

[/description]

### Examples
____________________________________________________

[example]

```
console.log(getUserId());
```

[/example]
____________________________________________________

[syntax]

### Syntax

```
getUserId();
```

[/syntax]

[parameters]

### Parameters

getUserId() does not take any parameters.

[/parameters]

[returns]

### Returns
Returns a unique identifier for the current user of this app.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
