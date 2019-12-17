/* global Maplace */

import $ from 'jquery';
import {getLocations} from '@cdo/apps/lib/ui/classroomMap';

var gmap;
var gmap_loc;
var selectize;

$(function() {
  selectize = $('#class-search-facets select').selectize({
    plugins: ['remove_button']
  });

  setFacetDefaults();

  $('#location')
    .geocomplete()
    .bind('geocode:result', function(event, result) {
      var loc = result.geometry.location;
      gmap_loc = loc.lat() + ',' + loc.lng();
      submitForm();
    });

  // Make the map sticky.
  $('#gmap').sticky({topSpacing: 0});

  // Trigger query when a facet is changed.
  $('#class-search-facets')
    .find('select')
    .change(function() {
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

  $.each(form_data, function(key, field) {
    if (field.value !== '' && field.name !== 'location') {
      params.push(field);
    }
  });

  return params;
}

function sendQuery(params) {
  $.post('/forms/ClassSubmission/query', $.param(params), function(response) {
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

function setFacetDefaults() {
  $.each(selectize, function(key, select) {
    // Class format dropdown selects "Out of school" by default
    // and all other dropdowns are cleared.
    if (selectize[key].id === 'class-format-category') {
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
  $('#class-search-error')
    .html(
      '<p>Sorry, please try again. First, search by location. Then, narrow your search with the filters.</p>'
    )
    .show();
}

function loadMap(locations) {
  var coordinates = gmap_loc.split(',');
  var lat = coordinates[0];
  var lng = coordinates[1];

  // Reset the map.
  $('#gmap').html('');
  gmap = new Maplace();

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
    map_options.afterOpenInfowindow = function(index, location, marker) {
      setDetailsTrigger(index, location, marker);
    };
  }

  gmap.Load(map_options);
}

function setDetailsTrigger(index, location, marker) {
  var details_trigger = '.location-details-trigger';
  $('#gmap').on('click', details_trigger, function() {
    $(details_trigger).colorbox({inline: true, width: '50%', open: true});
  });
}
