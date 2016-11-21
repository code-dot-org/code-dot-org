
function processResponse(data)
{
  // go through each key, and if the count is > 0, show the participant count
  for (var key in data)
  {
    var count = data[key];

    if (count > 0)
    {
      if (typeof addCommas == 'function') {
        count = addCommas(count);
      }

      $(".participants_value_" + key).text(count);
      $(".participants_string_" + key).show();
    }
  }
}

$(document).ready()
{
  $.ajax({
    url: "/v2/hoc/tutorial-metrics.json",
    dataType: "json"
  }).done(processResponse);
}