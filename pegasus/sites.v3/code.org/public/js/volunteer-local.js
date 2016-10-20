/* global google, Maplace */

var gmap;
var gmap_loc;
var selectize;

$(document).ready(function () {
  initializeMap();
  $('#contact-volunteer-form select').selectize({
    plugins: ['fast_click']
  });
});

$(function () {
  selectize = $('#volunteer-search-facets select').selectize({
    plugins: ['fast_click']
  });

  $("#location").geocomplete()
    .bind("geocode:result", function (event, result){
      var loc = result.geometry.location;
      gmap_loc = loc.lat() + ',' + loc.lng();
      resetFacets();
      initializeMap();
    });

  // Trigger query when a facet is changed.
  $('#volunteer-search-facets').find('select').change(function () {
    initializeMap();
  });
});

function initializeMap() {
  var form_data = $('#volunteer-search-form').serializeArray();

  // Clear the location details.
  $('#location-details').html('');

  var params = getParams(form_data);
  sendQuery(params);
}

function getLatLng(address) {
  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({'address': address}, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var loc;
      loc = results[0].geometry.location;
      gmap_loc = loc.d + ',' + loc.e;
    } else {
      displayQueryError();
    }
  });
}

function getParams(form_data) {
  var params = [];

  // Default showing US results
  if (!gmap_loc) {
    gmap_loc = '37.6,-95.665';

    params.push({
      name: 'distance',
      value: 3000
    });

    params.push({
      name: 'num_volunteers',
      value: 5000
    });
  }

  params.push({
    name: 'coordinates',
    value: gmap_loc
  });

  $.each(form_data, function (key, field) {
    if (field.value !== '' && field.name != 'location') {
      params.push(field);
    }
  });

  return params;
}

function sendQuery(params) {
  $.post('/forms/VolunteerEngineerSubmission2015/query', $.param(params), function (response) {
    var results = JSON.parse(response); // Convert the JSON string to a JavaScript object.
    var locations = getLocations(results);
    updateResults(locations);
    updateFacets(results);
  }).fail(displayQueryError);
}

function updateResults(locations) {
  if (locations.length > 0) {
    $('#controls').html('');
  } else {
    displayNoResults();
  }

  loadMap(locations);
}

function getLocations(results) {
  var locations = [];

  if (results.response) {
    var volunteers = results.response.docs; // The actual volunteers that were returned by Solr.
    var volunteers_count = volunteers.length;

    for (var index = 0; index < volunteers_count; index++) {
      var coordinates = volunteers[index].location_p.split(',');
      // 0.01 degree is approximately 1km. randomize within this 1km to avoid showing exact addresses
      var lat = coordinates[0] - 0.005 + (0.01 * Math.random());
      var lon = coordinates[1] - 0.005 + (0.01 * Math.random());
      var title = volunteers[index].name_s;
      var id = volunteers[index].id;
      var html = compileHTML(index, volunteers[index]);
      var contact_title = compileContact(index, volunteers[index]);
      var contact_link = '<a id="contact-trigger-' + index + '" class="contact-trigger" onclick="return contactVolunteer()">Contact</a>';

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
  $.each(selectize, function (key, select) {
    select.selectize.clear();
    select.selectize.refreshOptions(false);
  });
}

function updateFacets(results) {
  var facet_fields = results.facet_counts.facet_fields;
}

function displayNoResults() {
  $('#controls').html('<p>No results were found.</p>');

  // If a facet has a value, show the facets.
  var form_data = $('#volunteer-search-form').serializeArray();
  $.each(form_data, function (key, field) {
    if (field.name != 'location' && field.value) {
    }
  });
}

function displayQueryError() {
  $('#volunteer-search-results').hide();
  $('#volunteer-search-error').html('<p>An error occurred. Please try your search again.</p>').show();
}

function loadMap(locations) {
  var coordinates = gmap_loc.split(',');
  var lat = coordinates[0];
  var lng = coordinates[1];

  // Reset the map.
  $('#gmap').html('');
  gmap = new Maplace();

  var mapOptions = {
    mapOptions: {
      setCenter: [lat, lng],
      zoom: 12
    },
    controls_type: 'list',
    controls_on_map: false
  };

  if (locations.length > 0) {
    mapOptions.forceGenerateControls = true;
    mapOptions.locations = locations;
    mapOptions.afterOpenInfowindow = function (index, location, marker) {
      setContactTrigger(index, location, marker);
    };
  }

  gmap.Load(mapOptions);
}

function compileHTML(index, location) {
  var lines = [];
  var line;

  // Compile HTML.
  var html = '<h3>' + location.name_s + '</h3>';

  if (location.company_s) {
    line = location.company_s;
    lines.push(line);
  }

  if (location.experience_s) {
    line = '<strong>Experience: </strong>' + i18n(location.experience_s);
    lines.push(line);
  }

  if (location.location_flexibility_ss) {
    $.each(location.location_flexibility_ss, function (key, field) {
      location.location_flexibility_ss[key] = i18n('location_' + field);
    });

    line = '<strong>How I can help: </strong>' + location.location_flexibility_ss.join(', ');
    lines.push(line);
  }

  if (location.description_s) {
    line = '<strong>About me: </strong>' + location.description_s;
    lines.push(line);
  }

  if (location.linkedin_s) {
    if (!location.linkedin_s.match(/^https?:\/\//i)) {
      location.linkedin_s = 'http://' + location.linkedin_s;
    }

    line = '<a href="' + location.linkedin_s + '" target="_blank">LinkedIn profile</a>';
    lines.push(line);
  }

  if (location.facebook_s) {
    if (!location.facebook_s.match(/^https?:\/\//i)) {
      location.facebook_s = 'http://' + location.facebook_s;
    }

    line = '<a href="' + location.facebook_s + '" target="_blank">Facebook profile</a>';
    lines.push(line);
  }

  $.each(lines, function (key, field) {
    html += '<div class="profile-detail">' + field + '</div>';
  });

  return html;
}

function compileContact(index, location) {
  var details =  location.name_s + ' (' + i18n(location.experience_s) + ')';
  var html = '<div id="addressee-details-' + index + '">' + details + '</div>';
  $('#allnames').append(html);

  return html;
}

function setContactTrigger(index, location, marker) {
  var contact_trigger = '.contact-trigger';
  $('#gmap').on('click', contact_trigger, function () {
    $('#name').html(location.contact_title);
    $('#volunteer-id').val(location.id);
  });
}

function contactVolunteer() {
  $('#name').show();
  $('#volunteer-contact').show();
  $('#success-message').hide();
  $('#error-message').hide();
  adjustScroll('volunteer-contact');

  return false;
}

function processResponse(data) {
  $('#error-message').hide();
  $('#success-message').show();
}

function processError(data) {
  $('.has-error').removeClass('has-error');

  var errors = Object.keys(data.responseJSON);
  var errors_count = errors.length;

  for (var i = 0; i < errors_count; ++i) {
    var error_id = '#volunteer-contact-' + errors[i].replace(/_/g, '-');
    error_id = error_id.replace(/-[sb]s?$/, '');
    $(error_id).parents('.form-group').addClass('has-error');
  }

  var error = '<font color="#a94442">An error occurred. All fields are required Please check that all fields have been filled out properly.</font>';
  $('#error-message').html(error).show();
  $('#success-message').hide();
}

function sendEmail(data) {
  var typeTaskSelected = $('#volunteer-type-task input:checked').length > 0;
  if (typeTaskSelected) {
    $.ajax({
      url: "/forms/VolunteerContact2015",
      type: "post",
      dataType: "json",
      data: $('#contact-volunteer-form').serialize()
    }).done(processResponse).fail(processError);
  } else {
    var error = '<font color="#a94442">Please select at least one way for the volunteer to help.</font>';
    $('#error-message').html(error).show();
  }

  return false;
}

function adjustScroll(destination) {
  $('html, body').animate({
    scrollTop: $("#" + destination).offset().top
  }, 1000);
}

function i18n(token) {
  var labels = {
    'unspecified': 'Unspecified',
    'tech_company': 'Non-technical',
    'university_student_or_researcher': 'University CS Student',
    'software_professional': 'Technical Professional',
    'location_onsite': 'Classroom visit',
    'location_remote': 'Remotely'
  };

  return labels[token];
}
