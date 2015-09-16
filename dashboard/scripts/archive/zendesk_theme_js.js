/**
 * ALERT!!!
 * If you make changes to this, please also update the file at:
* https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/scripts/archive/zendesk_theme_js.js
 */

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
// populate the fields when the page is ready
$(document).ready(function () {
  populateFields();
});
