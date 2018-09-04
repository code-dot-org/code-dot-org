/* global Maplace */

var gmap;
var gmap_loc;
var selectize;

$(function () {
  selectize = $('#class-search-facets select').selectize({plugins: ["remove_button"]});

  setFacetDefaults();

  $("#location").geocomplete()
    .bind("geocode:result", function (event, result) {
      var loc = result.geometry.location;
      gmap_loc = loc.lat() + ',' + loc.lng();
      submitForm();
    });

  // Make the map sticky.
  $("#gmap").sticky({topSpacing:0});

  // Trigger query when a facet is changed.
  $('#class-search-facets').find('select').change(function () {
    submitForm();
  });
});

function submitForm() {
  var form_data = $('#class-search-form').serializeArray();

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

function getParams(form_data) {
  var params = [];

  params.push({
    name: 'coordinates',
    value: gmap_loc
  });

  $.each(form_data, function (key, field) {
    if (field.value !== '' && field.name !== 'location') {
      params.push(field);
    }
  });

  return params;
}

function sendQuery(params) {
  $.post('/forms/ClassSubmission/query', $.param(params), function (response) {
    var locations = getLocations(response);
    updateResults(locations);
  }).fail(displayQueryError);
}

function updateResults(locations) {
  if (locations.length > 0) {
    $('#controls').html('');
  } else {
    displayNoResults();
  }
  $('#class-search-results').show();

  loadMap(locations);
}

function getLocations(results) {
  var locations = [];

  if (results.response) {
    var places = results.response.docs; // The actual places that were returned by Solr.
    var places_count = places.length;

    for (var i = 0; i < places_count; i++) {
      var index = i;
      var coordinates = places[i].location_p.split(',');
      var lat = coordinates[0];
      var lon = coordinates[1];
      var title = places[i].school_name_s;
      var html = compileHTML(index, places[i]);
      var more_link = '<div><a id="location-details-trigger-' + index + '" class="location-details-trigger" onclick="event.preventDefault();" href="#location-details-' + index + '">More information</a></div>';

      var location = {
        lat: lat,
        lon: lon,
        title: title,
        html: html + more_link,
        zoom: 10
      };

      locations.push(location);
    }
  }

  return locations;
}

function setFacetDefaults() {
  $.each(selectize, function (key, select) {
    // Class format dropdown selects "Out of school" by default
    // and all other dropdowns are cleared.
    if (selectize[key].id === "class-format-category") {
      select.selectize.setValue('out_of_school');
    } else {
      select.selectize.clear();
    }
    select.selectize.refreshOptions(false);
  });
}

function displayNoResults() {
  $('#controls').html('<p>No results were found.</p>');
}

function displayQueryError() {
  $('#class-search-results').hide();
  $('#class-search-error').html('<p>Sorry, please try again. First, search by location. Then, narrow your search with the filters.</p>').show();
}

function loadMap(locations) {
  var coordinates = gmap_loc.split(',');
  var lat = coordinates[0];
  var lng = coordinates[1];

  // Reset the map.
  $('#gmap').html('');
  gmap = new Maplace;

  var map_options = {
    map_options: {
      set_center: [lat, lng],
      zoom: 12
    },
    controls_type: 'list',
    controls_on_map: false
  };

  if (locations.length > 0) {
    map_options.force_generate_controls = true;
    map_options.locations = locations;
    map_options.afterOpenInfowindow = function (index, location, marker) {
      setDetailsTrigger(index, location, marker);
    };
  }

  gmap.Load(map_options);
}

function compileHTML(index, location) {
  var lines = [];
  var line;

  // Compile HTML.
  var html = '<h3 class="entry-detail">' + location.school_name_s + '</h3>';

  if (location.school_address_s) {
    line = location.school_address_s;
    lines.push(line);
  }

  if (location.class_format_s) {
    line = '<strong>Format: </strong>' + i18n(location.class_format_category_s) + ' - ' + i18n(location.class_format_s);
    if (location.school_tuition_s === 'yes') {
      line += ' (private)';
    } else if (location.school_tuition_s === 'no') {
      line += ' (public)';
    }

    lines.push(line);
  }

  if (location.school_level_ss) {
    $.each(location.school_level_ss, function (key, field) {
      location.school_level_ss[key] = i18n('level_' + field);
    });

    line = '<strong>Level(s): </strong>' + location.school_level_ss.join(', ');
    lines.push(line);
  }

  if (location.class_languages_all_ss) {
    line = '<strong>Language(s): </strong>' + location.class_languages_all_ss.join(', ');
    lines.push(line);
  }

  $.each(lines, function (key, field) {
    html+= '<div class="entry-detail">' + field + '</div>';
  });

  // Add details to the page for displaying in a modal popup.
  var details = compileDetails(index, location, lines);
  addDetails(index, details);

  return html;
}

function setDetailsTrigger(index, location, marker) {
  var details_trigger = '.location-details-trigger';
  $('#gmap').on('click', details_trigger, function () {
    $(details_trigger).colorbox({inline:true, width:"50%", open:true});
  });
}

function i18n(token) {
  var labels = {
    'in_school': 'In school',
    'in_school_daily_programming_course': 'Daily programming course',
    'in_school_ap_computer_science': 'AP computer science',
    'in_school_full_university_cs_curriculum': 'Full university CS curriculum',
    'in_school_robotics_club': 'Robotics club',
    'in_school_programming_integrated_in_other_classes': 'Programming integrated in other classes',
    'in_school_summer_school_cs_program': 'Summer school CS program',
    'in_school_other': 'Other in school',
    'out_of_school': 'Out of school',
    'out_of_school_summer_camp': 'Summer camp',
    'out_of_school_afterschool_program': 'Afterschool program',
    'out_of_school_all-day_workshop': 'All-day workshop (up to 1 week)',
    'out_of_school_multi-week_workshop': 'Multi-week workshop',
    'out_of_school_other': 'Other out of school',
    'online': 'Online',
    'online_programming_class': 'Online programming class',
    'online_teacher_resource': 'Online teacher resource',
    'online_other': 'Other online',
    'level_preschool': 'Preschool',
    'level_elementary': 'Elementary',
    'level_middle_school': 'Middle school',
    'level_high_school': 'High school',
    'level_college': 'College',
    'level_vocational': 'Vocational',
    'languages_other': 'Other language(s)'
  };

  return labels[token];
}

function compileDetails(index, location, lines) {
  // Compile HTML.
  var html = '<h2 style="margin-top: 0; margin-bottom: .5em; padding-top: 0;">' + location.school_name_s + '</h2>';

  if (location.school_website_s) {
    if (!location.school_website_s.match(/^https?:\/\//i)) {
      location.school_website_s = 'http://' + location.school_website_s;
    }

    let line = '<strong>Website: </strong><a href="' + location.school_website_s + '" target="_blank">' + location.school_website_s + '</a>';
    lines.push(line);
  }

  $.each(lines, function (key, field) {
    html += '<div>' + field + '</div>';
  });

  if (location.class_description_s) {
    html += '<p style="margin-top: 1em;">' + location.class_description_s + '</p>';
  }

  return html;
}

function addDetails(index, details) {
  var details_html = '<div id="location-details-' + index + '">' + details + '</div>';
  $('#location-details').append(details_html);
}
