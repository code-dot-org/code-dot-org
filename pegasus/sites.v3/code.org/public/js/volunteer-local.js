/* global Maplace */
/* exported sendEmail */

var gmap;
var gmap_loc;
var selectize;

var firstRetrievalDone = false;

$(document).ready(function() {
  initializeMap();
  $("#contact-volunteer-form select").selectize();
});

$(function() {
  selectize = $("#volunteer-search-facets select").selectize({
    plugins: ["remove_button"]
  });

  $("#location")
    .geocomplete()
    .bind("geocode:result", function(event, result) {
      var loc = result.geometry.location;
      gmap_loc = loc.lat() + "," + loc.lng();
      resetFacets();
      initializeMap();
    });

  // Trigger query when a facet is changed.
  $("#volunteer-search-facets")
    .find("select")
    .change(function() {
      initializeMap();
    });
});

function initializeMap() {
  var form_data = $("#volunteer-search-form").serializeArray();

  // Clear the location details.
  $("#location-details").html("");

  var params = getParams(form_data);
  sendQuery(params);
}

function getParams(form_data) {
  var params = [];

  if (window.location.pathname === "/volunteer/remote") {
    gmap_loc = "37.6,-95.665";

    params.push({
      name: "distance",
      value: 10500
    });

    params.push({
      name: "num_volunteers",
      value: 1000
    });

    params.push({
      name: "location_flexibility_ss[]",
      value: "remote"
    });
  }

  // Default showing US results
  if (!gmap_loc) {
    // Westlake park, Seattle
    gmap_loc = "47.611089,-122.337034";
  }

  params.push({
    name: "coordinates",
    value: gmap_loc
  });

  $.each(form_data, function(key, field) {
    if (field.value !== "" && field.name !== "location") {
      params.push(field);
    }
  });

  return params;
}

function sendQuery(params) {
  $.post(
    "/forms/VolunteerEngineerSubmission2015/query",
    $.param(params),
    function(response) {
      var locations = getLocations(response);
      updateResults(locations);
    }
  ).fail(displayQueryError);
}

function updateResults(locations) {
  if (locations.length > 0) {
    $("#controls").html("");
  } else {
    displayNoResults();
  }

  // First retrieval shows pins across the entire US.  Subsequent retrievals
  // show pins much closer to a specified location.  For this reason, we don't
  // want to show the filter options at first, but only after a location has
  // been specified by the user.
  if (firstRetrievalDone) {
    $(".filter-options").fadeIn();
  } else {
    firstRetrievalDone = true;
  }

  loadMap(locations);
}

function getLocations(results) {
  var locations = [];

  if (results.response) {
    var volunteers = results.response.docs; // The actual volunteers that were returned by Solr.
    var volunteers_count = volunteers.length;

    for (var index = 0; index < volunteers_count; index++) {
      var coordinates = volunteers[index].location_p.split(",");
      // 0.01 degree is approximately 1km. randomize within this 1km to avoid showing exact addresses
      var lat = coordinates[0] - 0.005 + 0.01 * Math.random();
      var lon = coordinates[1] - 0.005 + 0.01 * Math.random();
      var title = escapeHtml(volunteers[index].name_s);
      var id = volunteers[index].id;
      var html = compileHTML(index, volunteers[index]);
      var contact_title = compileContact(index, volunteers[index]);
      var contact_link =
        '<a id="contact-trigger-' +
        index +
        '" class="contact-trigger" onclick="return contactVolunteer()">Contact</a>';

      var location = {
        lat: lat,
        lon: lon,
        title: title,
        id: id,
        contact_title: contact_title,
        html: html + contact_link,
        zoom: 10
      };

      locations.push(location);
    }
  }

  return locations;
}

function resetFacets() {
  $.each(selectize, function(key, select) {
    select.selectize.clear();
    select.selectize.refreshOptions(false);
  });
}

function displayNoResults() {
  $("#controls").html(
    '<p>Sorry! No volunteers were found with that search criteria. <a href="/volunteer/remote">Find a volunteer who can video chat</a> with your classroom and inspire your students.</p>'
  );

  // If a facet has a value, show the facets.
  var form_data = $("#volunteer-search-form").serializeArray();
  $.each(form_data, function(key, field) {
    if (field.name !== "location" && field.value) {
    }
  });
}

function displayQueryError() {
  $("#volunteer-search-results").hide();
  $("#volunteer-search-error")
    .html("<p>An error occurred. Please try your search again.</p>")
    .show();
}

function loadMap(locations) {
  var coordinates = gmap_loc.split(",");
  var lat = coordinates[0];
  var lng = coordinates[1];

  // Reset the map.
  $("#gmap").html("");
  gmap = new Maplace();

  var mapOptions = {
    mapOptions: {
      setCenter: [lat, lng],
      zoom: 12
    },
    controls_type: "list",
    controls_on_map: false
  };

  if (locations.length > 0) {
    mapOptions.forceGenerateControls = true;
    mapOptions.locations = locations;
    mapOptions.afterOpenInfowindow = function(index, location, marker) {
      setContactTrigger(index, location, marker);
    };
  }

  gmap.Load(mapOptions);
}

function createHTMLElement(tag, attributes, text) {
  let elem = document.createElement(tag);

  Object.keys(attributes || {}).forEach(key => {
    elem.setAttribute(key, attributes[key]);
  });

  if (text) {
    elem.appendChild(document.createTextNode(text));
  }

  return elem;
}

function createMapEntryDetail(elements) {
  let div = createHTMLElement("div", {
    class: "profile-detail entry-detail"
  });

  elements.forEach(elem => {
    div.appendChild(elem);
  });

  return div;
}

function compileHTML(index, location) {
  let html = createHTMLElement("div");

  html.appendChild(
    createMapEntryDetail([
      createHTMLElement("h3", { class: "entry-detail" }, location.name_s)
    ])
  );

  if (location.company_s) {
    html.appendChild(
      createMapEntryDetail([document.createTextNode(location.company_s)])
    );
  }

  if (location.experience_s) {
    html.appendChild(
      createMapEntryDetail([
        createHTMLElement("strong", null, "Experience:"),
        document.createTextNode(" " + i18n(location.experience_s))
      ])
    );
  }

  if (location.location_flexibility_ss) {
    location.location_flexibility_ss.forEach(function(field, index) {
      location.location_flexibility_ss[index] = i18n("location_" + field);
    });

    html.appendChild(
      createMapEntryDetail([
        createHTMLElement("strong", null, "How I can help:"),
        document.createTextNode(
          " " + location.location_flexibility_ss.join(", ")
        )
      ])
    );
  }

  if (location.description_s) {
    html.appendChild(
      createMapEntryDetail([
        createHTMLElement("strong", null, "About me:"),
        document.createTextNode(" " + location.description_s)
      ])
    );
  }

  if (location.linkedin_s) {
    if (!location.linkedin_s.match(/^https?:\/\//i)) {
      location.linkedin_s = "http://" + location.linkedin_s;
    }

    html.appendChild(
      createMapEntryDetail([
        createHTMLElement("strong", null, "LinkedIn profile:"),
        document.createTextNode(" " + location.linkedin_s)
      ])
    );
  }

  if (location.facebook_s) {
    if (!location.facebook_s.match(/^https?:\/\//i)) {
      location.facebook_s = "http://" + location.facebook_s;
    }

    html.appendChild(
      createMapEntryDetail([
        createHTMLElement("strong", null, "Facebook profile:"),
        document.createTextNode(" " + location.facebook_s)
      ])
    );
  }

  return html.innerHTML;
}

function compileContact(index, location) {
  var details = location.name_s + " (" + i18n(location.experience_s) + ")";
  var htmlStr = createHTMLElement(
    "div",
    {
      id: "addressee-details-" + index
    },
    details
  ).outerHTML;

  $("#allnames").append(htmlStr);

  return htmlStr;
}

function setContactTrigger(index, location, marker) {
  var contact_trigger = ".contact-trigger";
  $("#gmap").on("click", contact_trigger, function() {
    $("#name").html(location.contact_title);
    $("#volunteer-id").val(location.id);
  });
}

/* eslint-disable no-unused-vars */
function contactVolunteer() {
  $("#name").show();
  $("#volunteer-contact").show();
  $("#success-message").hide();
  $("#error-message").hide();
  adjustScroll("volunteer-contact");

  return false;
}

function processResponse(data) {
  $("#error-message").hide();
  $("#success-message").show();
}

function processError(data) {
  $(".has-error").removeClass("has-error");

  var errors = Object.keys(data.responseJSON);
  var errors_count = errors.length;

  for (var i = 0; i < errors_count; ++i) {
    var error_id = "#volunteer-contact-" + errors[i].replace(/_/g, "-");
    error_id = error_id.replace(/-[sb]s?$/, "");
    $(error_id)
      .parents(".form-group")
      .addClass("has-error");
  }

  var error =
    '<font color="#a94442">An error occurred. All fields are required. Please check that all fields have been filled out properly.</font>';
  $("#error-message")
    .html(error)
    .hide()
    .fadeTo("normal", 1);
  $("#success-message").hide();
}

function sendEmail(data) {
  var typeTaskSelected = $("#volunteer-type-task input:checked").length > 0;
  if (typeTaskSelected) {
    $.ajax({
      url: "/forms/VolunteerContact2015",
      type: "post",
      dataType: "json",
      data: $("#contact-volunteer-form").serialize()
    })
      .done(processResponse)
      .fail(processError);
  } else {
    var error =
      '<font color="#a94442">Please select at least one way for the volunteer to help.</font>';
    $("#error-message")
      .html(error)
      .show();
  }

  return false;
}
/* eslint-enable no-unused-vars */

function adjustScroll(destination) {
  $("html, body").animate(
    {
      scrollTop: $("#" + destination).offset().top
    },
    1000
  );
}

function i18n(token) {
  var labels = {
    unspecified: "Unspecified",
    tech_company: "Non-technical",
    university_student_or_researcher: "University CS Student",
    software_professional: "Technical Professional",
    location_onsite: "Classroom visit",
    location_remote: "Remotely"
  };

  return labels[token];
}

/**
 * Replaces special characters in string by HTML entities.
 * List of special characters is taken from
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 *
 * This is a copy of the same function from @cdo/apps/src/utils.js.
 *
 * @param {string} unsafe - The string to escape.
 * @returns {string} Escaped string. Returns an empty string if input is null or undefined.
 */
function escapeHtml(unsafe) {
  return unsafe
    ? unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/\//g, "&#47;")
    : "";
}
