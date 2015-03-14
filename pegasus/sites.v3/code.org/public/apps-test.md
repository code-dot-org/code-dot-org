<script src="/shared/js/apps_api.js"></script>

<script>
  $(document).ready(function() {
    var apps = storageApps();
    var app_id = null;
    
    apps.create(({
      name: "My Cool App"
    }), function(app) {
      alert(JSON.stringify(app));
    });
  });
</script>
