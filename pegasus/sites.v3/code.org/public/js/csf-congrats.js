var cookieValue;

function getURLParameter(name) {
  return decodeURI(
    (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function processResponse(data)
{
  certificate_processResponse(data);
}

$(document).ready(function()
{
  $('#share-fb a').bind('click', function() {
    $("#share-fb").hide(); $("#like-fb").css('display', 'inline-block');
  });
  $('#share-twitter a').bind('click', function() {
    $("#share-twitter").hide(); $("#follow-twitter").css('display', 'inline-block');
  });

  // placeholder text for non-HTML5 browsers
  $('input[type=text], textarea').placeholder();
  $('input[type=email], textarea').placeholder();

  cookieValue = getURLParameter("i");
  courseNameValue = getURLParameter("s");

  if (cookieValue != "null")
  {
    $.ajax({
      url: "/api/hour/status/" + cookieValue,
      dataType: "json"
    }).done(processResponse);
  }
});

var petition;
$(document).ready(function()
{
  petition = new Petition();
});
