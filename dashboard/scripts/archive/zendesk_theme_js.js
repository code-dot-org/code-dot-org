/**
 * ALERT!!!
 * If you make changes to this, please also update the file at:
* https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/scripts/archive/zendesk_theme_js.js
 */

 // TODO (brent) - also backup css?

/**
 * Backup of theme javascript included in the support.code.org ZenDesk template
 * customizations.
 *
 * Modify template at: https://support.code.org/hc/admin/appearance
 *
 * Please keep this backup up-to-date.
 */

/*
 * jQuery v1.9.1 included
 */

$(document).ready(function() {

  // social share popups
  $(".share a").click(function(e) {
    e.preventDefault();
    window.open(this.href, "", "height = 500, width = 500");
  });

  // toggle the share dropdown in communities
  $(".share-label").on("click", function(e) {
    e.stopPropagation();
    var isSelected = this.getAttribute("aria-selected") == "true";
    this.setAttribute("aria-selected", !isSelected);
    $(".share-label").not(this).attr("aria-selected", "false");
  });

  $(document).on("click", function() {
    $(".share-label").attr("aria-selected", "false");
  });

  // show form controls when the textarea receives focus
  $(".answer-body textarea").one("focus", function() {
    $(".answer-form-controls").show();
  });

  $(".comment-container textarea").one("focus", function() {
    $(".comment-form-controls").show();
  });

  $('.user-nav .submit-a-request').html('Contact Us');

  $("h1:contains(Submit a request)").html("Contact Us");

  var mailingAddress = "1301 5th Ave, Suite 1225<br/>Seattle WA 98101<br/><br/>"
  $("h1:contains(Contact Us)").after(mailingAddress);
});

//
// Allow certain custom fields to be overridden
// via /web/20141208185608/https://support.zendesk.com/entries/24080143-Can-I-modify-or-pre-fill-the-Submit-a-requeqst-form-
//
(function ($) {
  $.QueryString = (function (a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
      var p = a[i].split('=');
      if (p.length != 2) continue;
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  })(window.location.search.substr(1).split('&'));
})(jQuery);

// store select query string parameters
var description = $.QueryString["description"]
var populateFields = function () {
  var $description = $('#request_description');
  if ($description) {
    $description.val(description);
  }
};

/**
 * Add some text + links to the bottom of the form (just above the submit button)
 */
var addPrivacyPolicyTosToFooter = function () {
  var footerLinkStyle = {
    textDecoration: 'underline',
    marginRight: '0px',
    color: '#7665A0'
  };
  var privacyPolicyLink = $('<a href="https://code.org/privacy">')
    .css(footerLinkStyle)
    .text('Privacy Policy');
  var tosLink = $('<a href="https://code.org/tos">')
    .css(footerLinkStyle)
    .text('Terms of Service');
  $("<div>").css({
      textAlign: 'left',
      paddingBottom: '10px'
    })
    .append(
      'By submitting this information, you acknowledge it will be handled in ' +
      'accordance with the terms of the ')
    .append(privacyPolicyLink)
    .append(' and the ')
    .append(tosLink)
    .insertBefore($("#new_request footer").children(0));
};

/**
 * Validates our report abuse form. Alerts about error if there is one.
 * @returns {boolean} false if The form is not valid
 */
var validateReportAbuseForm = function () {
  if ($("#request_anonymous_requester_email").val() === "") {
    alert("Please provide an email address");
    return false;
  }

  if ($("#request_custom_fields_24024923").val() === "") {
    alert('Please specify an age');
    return false;
  }

  if ($("#request_custom_fields_27739408").val() === "") {
    alert('Please answer how this content violates the Terms of Service');
    return false;
  }

  if ($("#request_description").val() === "") {
    alert('Please fill in the Message field');
    return false;
  }
  return true;
};

/**
 * POSTS to our server, incrementing the abuse score
 */
var incrementAbuseScore = function () {
  // TODO - how do we keep this in sync with our codebase?
  // TODO - point at prod
  $.ajax({
    url: "http://localhost:3000/v3/channels/" + $.QueryString["abuseChannelId"] + "/abuse",
    type: "post",
    contentType: "application/json; charset=utf-8"
  }).done(function(data, result) {
    console.log('done');
  }).fail(function(request, status, error) {
    // TODO - what should actually happen on error
    var err = new Error('status: ' + status + '; error: ' + error);
  });
};

/**
 * Handle the case where we want a slighly different form for reporting abuse
 */
var populateReportAbuseForm = function () {
  var abuseChannelId = $.QueryString["abuseChannelId"];
  if (abuseChannelId === undefined) {
    return;
  }

  var ABUSE_URL = ".request_custom_fields_27733637";
  var ABUSE_TYPE = ".request_custom_fields_27739408";

  $(ABUSE_URL + ' input')
    .val(document.referrer)
    .prop('readonly', true)
    .prop('disabled', true)
    .css('background-color', '#ddd'); // chrome doesn't automatically make disabled gray

  // show red required asterisk
  $(ABUSE_TYPE).addClass('required').removeClass('optional');

  $(ABUSE_TYPE).show();
  $(ABUSE_URL).show();

  // Change the message text
  $(".request_description p")
    .text("Please provide as much detail as possible regarding the content you are reporting.")
    .insertBefore(".request_description textarea");

  $("#new_request").on('submit', function () {
    // We can't depend on server side validation, as it clears our query params
    // Instead, validate required fields here
    if (!validateReportAbuseForm()) {
      return false;
    }

    // post to increment score
    incrementAbuseScore();

    alert('temp blocking submission for test purposes');
    return false;
  });
};
// TODO dont include in what ends up on zendesk
populateReportAbuseForm();
addPrivacyPolicyTosToFooter();


// populate the fields when the page is ready
$(document).ready(function () {
  populateFields();
  populateReportAbuseForm();
  addPrivacyPolicyTosToFooter();
});
