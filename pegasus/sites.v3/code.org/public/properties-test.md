<script src="/shared/js/apps_api.js"></script>

<script>
  $(document).ready(function() {
    app_id = 'NRXovq6ocjU0GtJb0bxZcw==';

    properties = sharedProperties(app_id);
    //properties = userProperties(app_id)

    // Set a value
    properties.set('name', 'Shared Name', function(success) {
      alert("set['name'] = 'Shared Name' - passed: " + success);

      // Get all the properties and make sure our value is present.
      properties.all(function(value) {
        alert("all.name = " + value.name + " - passed: " + (value.name == "Shared Name"));
      
        // Get just that value and make sure it's what we set.
        properties.get('name', function(value) {
          alert("get(name) = " + value + " - passed: " + (value == "Shared Name"));

          // Delete the value we just set
          properties.delete('name', function(success) {
            alert("delete(name) - passed: " + success);

            // Get all the values and make sure it is no longer present.
            properties.all(function(value) {
              alert("all.name = " + value.name + " - passed: " + (value.name == undefined));

              // Try to get the value, it should be undefined because it was deleted.
              properties.get('name', function(value) {
                alert("get(name) = " + value + " - passed: " + (value == undefined));

                // Try to delete the value, it should fail because it was deleted. 
                properties.delete('name', function(success) {
                  alert("delete(name) - passed: " + !success);
                });
              });
            });
          });
        });
      });
    });
  });
</script>
