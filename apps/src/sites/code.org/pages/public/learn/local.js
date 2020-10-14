/* global mapboxgl, MapboxGeocoder */

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import {getLocations} from '@cdo/apps/lib/ui/classroomMap';
import logToCloud from '@cdo/apps/logToCloud';
import LocalControlList from '@cdo/apps/templates/LocalControlList';

var map;
var map_loc;
var selectize;

// This is for older browsers that don't support remove.
// We need this to clear the popups when the user clicks "View All" to see all classes or when a different class is selected in the results list.
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

$(function() {
  selectize = $('#class-search-facets select').selectize({
    plugins: ['remove_button']
  });

  setFacetDefaults();
  $('#mapboxgeocoder').show();
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    types: 'country,region,district,postcode,locality,place'
  });
  geocoder.on('result', function(result) {
    var loc = result.result.geometry.coordinates;
    map_loc = loc[1] + ',' + loc[0];
    submitForm();
  });
  geocoder.addTo('#mapboxgeocoder');

  // Make the map sticky.
  $('#map').sticky({topSpacing: 0});

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
  if (!map_loc) {
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
    value: map_loc
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
  var coordinates = map_loc.split(',');
  var lat = coordinates[0];
  var lng = coordinates[1];

  // Reset the map.
  $('#map').html('');
  const featureList = locations.map((location, index) => ({
    type: 'Feature',
    properties: {
      description: location.html,
      title: location.title,
      index
    },
    geometry: {
      type: 'Point',
      coordinates: [parseFloat(location.lon), parseFloat(location.lat)]
    }
  }));
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 10,
    minZoom: 1,
    center: [lng, lat]
  });
  map.on('load', function() {
    map.loadImage('/images/map-markers/dot-marker.png', function(error, image) {
      if (error) {
        logToCloud.addPageAction(logToCloud.PageAction.MapboxMarkerLoadError, {
          error
        });
        throw error;
      }
      map.addImage('dot-marker', image);
      map.addSource('places', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: featureList
        }
      });
      // Add a layer showing the places.
      map.addLayer({
        id: 'places',
        type: 'symbol',
        source: 'places',
        layout: {
          'icon-image': 'dot-marker',
          'icon-allow-overlap': true
        }
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'places', function(e) {
        var coordinates = e.features[0].geometry.coordinates.slice();

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        resultList(featureList, lng, lat, e.features[0].properties.index + 1);
        createPopUp(e.features[0]);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'places', function() {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'places', function() {
        map.getCanvas().style.cursor = '';
      });
    });
  });
  // builds the side menu with the list of classes
  if (featureList.length > 0) {
    resultList(featureList, lng, lat, 0);
  }
}

function setDetailsTrigger() {
  var details_trigger = '.location-details-trigger';
  $('#map').on('click', details_trigger, function() {
    $(details_trigger).colorbox({inline: true, width: '50%', open: true});
  });
}

function flyToLocation(currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 15
  });
}

function createPopUp(currentFeature) {
  clearPopUp();
  new mapboxgl.Popup()
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(currentFeature.properties.description)
    .addTo(map);
  setDetailsTrigger();
}

function clearPopUp() {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0]) {
    popUps[0].remove();
  }
}

function resultList(featureList, lng, lat, activeIndex) {
  const container = document.getElementById('controls');
  ReactDOM.render(
    <LocalControlList
      selected={activeIndex}
      featureList={featureList}
      lng={lng}
      lat={lat}
      updateActive={resultList}
      flyToLocation={flyToLocation}
      createPopUp={createPopUp}
      resetMap={() => {
        clearPopUp();
        map.flyTo({
          center: [lng, lat],
          zoom: 10
        });
      }}
    />,
    container
  );
}
