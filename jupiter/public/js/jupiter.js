function integratePivotalTracker(username, password, callback) {
  $.ajax({
    url: '/integrate/pivotaltracker',
    type: "post",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify({username:username, password:password})
  }).done(function(data, text) {
    callback(data);
  }).fail(function(request, status, error) {
    callback(null);
  });
}
