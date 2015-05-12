module.exports = function () {
  // TODO (brent) : we should just export this object
  return {
    api_base_url: "/v3/channels",

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

    create: function(value, callback) {
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

    update: function(id, value, callback) {
      $.ajax({
        url: this.api_base_url + "/" + id,
        type: "post",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(value)
      }).done(function(data, text) {
        callback(data)
      }).fail(function(request, status, error) {
        callback(false)
      });
    }
  };
}
