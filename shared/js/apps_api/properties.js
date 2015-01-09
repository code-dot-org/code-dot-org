function AppProperties(app_id)
{
  var object = {
    api_base_url: "/v2/apps/" + app_id + "/properties",

    all: function(callback) {
      $.ajax({
        url: this.api_base_url,
        type: "get",
        dataType: "json",
      }).done(function(data, text) {
        callback(data);
      }).fail(function(request, status, error) {
        callback(null);
      });
    },
  
    get: function(key, callback) {
      $.ajax({
        url: this.api_base_url + "/" + key,
        type: "get",
        dataType: "json",
      }).done(function(data, text) {
        callback(data);
      }).fail(function(request, status, error) {
        callback(undefined);
      });  
    },
  
    set: function(key, value, callback) {
      $.ajax({
        url: this.api_base_url + "/" + key,
        type: "post",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(value)
      }).done(function(data, text) {
        callback(true)
      }).fail(function(request, status, error) {
        callback(false)
      });
    },

    delete: function(key, callback) {
      $.ajax({
        url: this.api_base_url + "/" + key + "/delete",
        type: "post",
        dataType: "json",
      }).done(function(data, text) {
        callback(true)
      }).fail(function(request, status, error) {
        callback(false)
      });
    }
  }
  
  return object;
}

function UserProperties(app_id)
{
  properties = AppProperties(app_id);
  properties.api_base_url = "/v2/apps/" + app_id + "/user-properties";
  return properties;
}
