  var cookieValue;

  function getURLParameter(name) {
    return decodeURI(
      (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
  }

  function processResponse(data)
  {
    //console.log("Processing response: ", data);

    if (!data.started)
    {
      //console.log("Response indicates not started.")
      //window.location = "/learn";
    }

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

    // checking for "studio" won't work on local instances as domain is 0.0.0.0:3000
    if (!((document.referrer.indexOf("studio") != -1 || document.referrer.indexOf("learn") != -1) && document.referrer.indexOf("frozen") == -1)) {
      $('#print_option').show();
    }

    // placeholder text for non-HTML5 browsers
    $('input[type=text], textarea').placeholder();
    $('input[type=email], textarea').placeholder();

    cookieValue = getURLParameter("i");

    if (cookieValue != "null")
    {
      $.ajax({
        url: "/api/hour/status/" + cookieValue,
        dataType: "json"
      }).done(processResponse);
    }
    else
    {
      certificate_disable();
    }
  });
