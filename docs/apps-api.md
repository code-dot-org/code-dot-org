# Apps API

This document describes the API we provide to "apps." This API is used as the back-end for student-built CSP apps though it is useful in many other contexts.

```
<script src="/shared/js/apps_api.js"></script>
```

## Storage Subsystem

Each application has a unique identifier (`app_id`). This is an opaque value established and returned by when an application is created. Apps are "owned" by a user so there is a mapping from `user_id` to `app_id`.

User storage for these APIs are linked to a storage identifier, rather than a user-identifier. For anonymous users, the storage-id is stored in a cookie. For logged-in users, the user-id is mapped to the storage-id. When an account is created, the ownership of the cooke storage-id is transferred to the new user account.

## `sharedProperties` and `userProperties`

This API provides server-backed property bags (hashes). The `sharedProperties` bag contains values shared by all users of the application. The `userProperties` bag contains values specific to a particular user. Except for the constructor, the interface for the two objects are identical.

```
var properties = sharedProperties(app_id);
```

```
var properties = userProperties(app_id);
```

### `.all`

Retrieves the entire property bag and returns it as a hash.

```
userProperties(app_id).all(function(items) {
  alert(JSON.stringify(items));
});
```

### `.get`

Retrieves a property value by name.

```
userProperties(app_id).get("name", function(value) {
  alert(value);
});
```

### `.set`

Set a property value by name.

```
userProperties(app_id).set("name", "value", function(success) {
  alert(success);
});
```

### `.delete`

Delete a property by name.

```
userProperties(app_id).delete("name", function(success) {
  alert(success);
});
```

## `sharedTable` and `userTable`

This API provides server-backed "tables" - named arrays of hashes with an autoincrementing `id` property. No schema is enforced, rows do not need to be identical. Server-side searching/filtering is *not supported* because that is complex to build and this API is designed for small datasets (e.g. 1000 items or less) where filtering can be done on the client. Except for the constructor, the interface for the two objects are identical.

```
var table = sharedTable(app_id, "table-name");
```

```
var table = userTable(app_id, "table-name");
```

### `.all`

Retrieves all the rows in the table and returns them as an array of hashes.

```
var table = userTable(app_id, "table-name");
table.all(function(rows) {
  for (var i = 0; i < rows.length; i++) {
    alert(JSON.stringify(rows[i]));
  }
});
```

### `.delete`

Deletes a row by id.

```
var table = userTable(app_id, "table-name");
table.delete(row_id, function(success) {
  alert(success);
});
```

### `.insert`

Inserts a new row and returns it with an `id`.

```
var table = userTable(app_id, "table-name");
table.insert(({"Hello": "World"}), function(row) {
  //success = row != undefined
  //row_id = row["id"]
  alert(JSON.stringify(row));
});
```

### `.fetch`

Retrieve a row by id.

```
var table = userTable(app_id, "table-name");
table.fetch(id, function(row) {
  //success = row != undefined
  alert(JSON.stringify(row));
});
```

### `.update`

Modify an existing row value by id.

```
var table = userTable(app_id, "table-name");
table.update(row_id, ({"Hello": "Goodbye"}), function(success) {
  alert(success);
});
```
