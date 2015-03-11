function sharedTable(channel_id, table_name)
{
  var object = {
    api_base_url: "/v3/shared-tables/" + channel_id + "/" + table_name,

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
  
    fetch: function(id, callback) {
      $.ajax({
        url: this.api_base_url + "/" + id,
        type: "get",
        dataType: "json",
      }).done(function(data, text) {
        callback(data);
      }).fail(function(request, status, error) {
        callback(undefined);
      });
    },
    
    insert: function(value, callback) {
      $.ajax({
        url: this.api_base_url,
        type: "post",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(value)
      }).done(function(data, text) {
        callback(data);
      }).fail(function(request, status, error) {
        callback(undefined);
      });
    },
  
    update: function(id, value, callback) {
      $.ajax({
        url: this.api_base_url + "/" + id,
        type: "post",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(value)
      }).done(function(data, text) {
        callback(true)
      }).fail(function(request, status, error) {
        callback(false)
      });
    },

    delete: function(id, callback) {
      $.ajax({
        url: this.api_base_url + "/" + id + "/delete",
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

function userTable(channel_id, table_name)
{
  var table = sharedTable(channel_id, table_name);
  table.api_base_url = "/v3/user-tables/" + channel_id + "/" + table_name;
  return table;
}
