## Tables

### `AppTable` and `UserTable`

Except for the constructor, the interface for the shared and user-specific tables are identical.

```
var table = AppTable(app_id, "table-name");
```

```
var table = UserTable(app_id, "table-name");
```

### .all

```
var table = UserTable(app_id, "table-name");
table.all(function(rows) {
  for (var i = 0; i < rows.length; i++) {
    alert(JSON.stringify(rows[i]));
  }
});
```

### .delete

```
var table = UserTable(app_id, "table-name");
table.delete(row_id, function(success) {
  alert(success);
});
```

### .insert

```
var table = UserTable(app_id, "table-name");
table.insert(({"Hello": "World"}), function(row) {
  //success = row != undefined
  //row_id = row["id"]
  alert(JSON.stringify(row));
});
```

### .fetch

```
var table = UserTable(app_id, "table-name");
table.fetch(id, function(row) {
  //success = row != undefined
  alert(JSON.stringify(row));
});
```

### .update

```
var table = UserTable(app_id, "table-name");
table.update(row_id, ({"Hello": "Goodbye"}), function(success) {
  alert(success);
});
```
