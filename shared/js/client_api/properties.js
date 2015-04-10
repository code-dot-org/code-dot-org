function sharedProperties(channel_id)
{
  var object = {
    api_base_url: "/v3/shared-properties/" + channel_id,

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

function userProperties(channel_id)
{
  var properties = sharedProperties(channel_id);
  properties.api_base_url = "/v3/user-properties/" + channel_id;
  return properties;
}
