var gmap;
var gmap_loc;

$(function() {
  selectize = $('#volunteer-search-facets select').selectize({
    plugins: ['fast_click']
  });

  $("#location").geocomplete()
    .bind("geocode:result", function(event, result){
      var loc = result.geometry.location;
      gmap_loc = loc.lat() + ',' + loc.lng();
      resetFacets();
      submitForm();
    });

  // Make the map sticky.
  $("#gmap").sticky({topSpacing:0});

  // Trigger query when a facet is changed.
  $('#volunteer-search-facets').find('select').change(function() {
    submitForm();
  });
});

function submitForm() {
  var form_data = $('#volunteer-search-form').serializeArray();

  // Clear the location details.
  $('#location-details').html('');

  // If we still don't have coordinates, display an error.
  if (!gmap_loc) {
    displayQueryError();
    return;
  }

  var params = getParams(form_data);
  sendQuery(params);
}

function getLatLng(address) {
  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({'address': address}, function(results, status) {
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

  params.push({
    name: 'coordinates',
    value: gmap_loc
  });

  $.each(form_data, function(key, field) {
    if (field.value !== '' && field.name != 'location') {
      params.push(field);
    }
  });

  return params;
}

function sendQuery(params) {
  $.post('/forms/VolunteerEngineerSubmission2015/query', $.param(params), function(response){
    var results = JSON.parse(response); // Convert the JSON string to a JavaScript object.
    var locations = getLocations(results);
    updateResults(locations);
    updateFacets(results);
  }).fail(displayQueryError);
}

function updateResults(locations) {
  if (locations.length > 0) {
    $('#volunteer-search-facets').show();
    $('#controls').html('');
  } else {
    displayNoResults();
  }
  $('#volunteer-search-results').show();

  loadMap(locations);
}

function getLocations(results) {
  var locations = [];

  if(results.response){
    var volunteers = results.response.docs; // The actual volunteers that were returned by Solr.
    var volunteers_count = volunteers.length;

    for(var index = 0; index < volunteers_count; index++){
      var coordinates = volunteers[index].location_p.split(',');
      var lat = coordinates[0];
      var lon = coordinates[1];
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
  $.each(selectize, function(key, select) {
    select.selectize.clear();
    select.selectize.refreshOptions(false);
  });
}

function updateFacets(results) {
  var facet_fields = results.facet_counts.facet_fields;
}

function displayNoResults() {
  $('#controls').html('<p>No results were found.</p>');

  // Hide the facets by default.
  $('#volunteer-search-facets').hide();

  // If a facet has a value, show the facets.
  var form_data = $('#volunteer-search-form').serializeArray();
  $.each(form_data, function(key, field) {
    if (field.name != 'location' && field.value) {
      $('#volunteer-search-facets').show();
    }
  });
}

function displayQueryError() {
  $('#volunteer-search-facets').hide();
  $('#volunteer-search-results').hide();
  $('#volunteer-search-error').html('<p>An error occurred. Please try your search again.</p>').show();
}

function loadMap(locations) {
  var coordinates = gmap_loc.split(',');
  var lat = coordinates[0];
  var lng = coordinates[1];

  // Reset the map.
  $('#gmap').html('');
  gmap = new Maplace;

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
    mapOptions.afterOpenInfowindow = function(index, location, marker) {
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
    $.each(location.location_flexibility_ss, function(key, field) {
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

  $.each(lines, function(key, field) {
    html += '<div>' + field + '</div>';
  });

  return html;
}

function compileContact(index, location)
{
  var details =  location.name_s + ' (' + i18n(location.experience_s) + ')';
  var html = '<div id="addressee-details-' + index + '">' + details + '</div>';
  $('#allnames').append(html);
  
  return html;
}

function setContactTrigger(index, location, marker) {
  var contact_trigger = '.contact-trigger';
  $('#gmap').on('click', contact_trigger, function() {
    $('#name').html(location.contact_title);
    $('#volunteer-id').val(location.id);
  });
}

function contactVolunteer()
{
  $('#volunteer-map').hide();
  $('#name').show();
  $('#volunteer-contact').show();
  $('body').scrollTop(0);

  return false;
}

function processResponse(data)
{
  $('#contact-volunteer-form').hide();
  $('#before-contact').hide();
  $('#after-contact').show();
}

function processError(data)
{
  $('.has-error').removeClass('has-error');
  
  var errors = Object.keys(data.responseJSON);
  var errors_count = errors.length;

  for (var i = 0; i < errors_count; ++i) {
    var error_id = '#volunteer-contact-' + errors[i].replace(/_/g, '-');
    error_id = error_id.replace(/-[sb]s?$/, '');
    $(error_id).parents('.form-group').addClass('has-error');
  }
  
  $('#error_message').html('<font color="#a94442">An error occurred. Please check that all required fields have been filled out properly.</font>').show();
  
  $('body').scrollTop(0);
  $("#contact-submit-btn").prop('disabled', false);
  $("#contact-submit-btn").removeClass("button_disabled").addClass("button_enabled");
}

function sendEmail(data)
{
  $("#contact-submit-btn").prop('disabled', true);
  $("#contact-submit-btn").removeClass("button_enabled").addClass("button_disabled");

  $.ajax({
    url: "/forms/VolunteerContact2015",
    type: "post",
    dataType: "json",
    data: $('#contact-volunteer-form').serialize()
  }).done(processResponse).fail(processError);

  return false;
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
