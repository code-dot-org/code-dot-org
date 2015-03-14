<script src="/shared/js/apps_api.js"></script>

<script>
  $(document).ready(function() {
    app_id = 'NRXovq6ocjU0GtJb0bxZcw==';

    /*var table = UserTable(app_id, "table-name");
    table.insert(({"Hello": "World"}), function(row) {
      alert(JSON.stringify(row));
    });*/

    /*var table = UserTable(app_id, "table-name");
    table.fetch(3, function(row) {
      alert(JSON.stringify(row));
    });*/

    /*var table = UserTable(app_id, "table-name");
    table.update(3, ({"Hello": "Goodbye"}), function(success) {
      alert(success);
    });*/
    
    /*var table = UserTable(app_id, "table-name");
    table.all(function(rows) {
      for (var i = 0; i < rows.length; i++) {
        alert(JSON.stringify(rows[i]));
      }
    });*/

    //var table = sharedTable(app_id, 'test');
    var table = userTable(app_id, 'test')

    // Insert a row
    table.insert(({"Hello": "World"}), function(row) {
      alert("insert({Hello: World}) - passed: " + (row != undefined && row["Hello"] == "World"));

      // Fetch all the rows to make sure the row we just created is in the list
      table.all(function(rows) {
        var found = false;
        for (var i = 0; i < rows.length; i++) {
          if(rows[i]["id"] == row["id"]) {
            found = true;
            break;
          }
        }
        alert("all contains row[" + row['id'] + "] - passed: " + found);

        // Get the row we just created by id and verify it matches
        table.fetch(row["id"], function(same_row) {
          alert("fetch(" + row["id"] + ") - passed: " + (same_row["id"] == row["id"] && same_row["Hello"] == row["Hello"]));

          // Delete the row we just created
          table.delete(row["id"], function(success) {
            alert("delete(" + row["id"] + ") - passed: " + success);

            // Get all the values and make sure it is no longer present.
            table.all(function(rows) {
              found = false;
              for (var i = 0; i < rows.length; i++) {
                if(rows[i]["id"] == row["id"]) {
                  found = true;
                  break;
                }
              }
              alert("all doesn't contain row[" + row['id'] + "] - passed: " + !found);

              // Try to get the value, it should be undefined because it was deleted.
              table.fetch(row["id"], function(same_row) {
                alert("fetch(" + row["id"] + ") = undefined - passed: " + (same_row == undefined));

                // Try to delete the value, it should fail because it was deleted. 
                table.delete(row["id"], function(success) {
                  alert("delete(" + row["id"] + ") (row doesn't exist) - passed: " + !success);
                });
              });
            });
          });
        });
      });
    });
  });
</script>
