function sharedTable(app_id, table_name)
{
  var object = {
    api_base_url: "/v2/apps/" + app_id + "/tables/" + table_name,

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

function userTable(app_id, table_name)
{
  table = sharedTable(app_id, table_name);
  table.api_base_url = "/v2/apps/" + app_id + "/user-tables/" + table_name;
  return table;
}
