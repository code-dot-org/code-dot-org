/* global Maplace, mapboxgl */

import $ from 'jquery';
import {getLocations} from '@cdo/apps/lib/ui/classroomMap';

var gmap;
var gmap_loc;
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
  if (window.location.search.includes('mapbox')) {
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
    gmap = new mapboxgl.Map({
      container: 'gmap',
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 10,
      minZoom: 1,
      center: [lng, lat]
    });
    gmap.on('load', function() {
      gmap.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        function(error, image) {
          // do stuff
          if (error) {
            throw error;
          }
          gmap.addImage('custom-marker', image);
          gmap.addSource('places', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: featureList
            }
          });
          // Add a layer showing the places.
          gmap.addLayer({
            id: 'places',
            type: 'symbol',
            source: 'places',
            layout: {
              'icon-image': 'custom-marker',
              'icon-allow-overlap': true
            }
          });

          // When a click event occurs on a feature in the places layer, open a popup at the
          // location of the feature, with description HTML from its properties.
          gmap.on('click', 'places', function(e) {
            var coordinates = e.features[0].geometry.coordinates.slice();

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            var activeItem = document.querySelector('li.active');
            if (activeItem) {
              activeItem.classList.remove('active');
            }
            document
              .querySelector(`#control-${e.features[0].properties.index}`)
              .classList.add('active');
            createPopUp(e.features[0]);
          });

          // Change the cursor to a pointer when the mouse is over the places layer.
          gmap.on('mouseenter', 'places', function() {
            gmap.getCanvas().style.cursor = 'pointer';
          });

          // Change it back to a pointer when it leaves.
          gmap.on('mouseleave', 'places', function() {
            gmap.getCanvas().style.cursor = '';
          });
        }
      );
    });
    if (featureList.length > 0) {
      const linkStyle =
        'color: rgb(102, 102, 102); display: block; padding: 5px; font-size: inherit; text-decoration: none; cursor: pointer;';
      var controlList = document.createElement('ul');
      controlList.classList.add('ullist');
      controlList.classList.add('controls');
      controlList.style = 'margin: 0px; padding: 0px; list-style-type: none;';
      var viewAll = document.createElement('li');
      viewAll.classList.add('active');
      var viewAllLink = document.createElement('a');
      viewAllLink.setAttribute('data-load', 'all');
      viewAllLink.id = 'ullist_a_all';
      viewAllLink.style = linkStyle;
      viewAllLink.addEventListener('click', function(e) {
        var activeItem = document.querySelector('li.active');
        if (activeItem) {
          activeItem.classList.remove('active');
        }
        viewAll.classList.add('active');
        clearPopUps();
        gmap.flyTo({
          center: [lng, lat],
          zoom: 10
        });
      });
      var titleSpan = document.createElement('span');
      titleSpan.innerHTML = 'View All';
      viewAllLink.append(titleSpan);
      viewAll.append(viewAllLink);
      controlList.append(viewAll);
      featureList.forEach((feature, index) => {
        var listItem = document.createElement('li');
        listItem.id = `control-${index}`;
        var link = document.createElement('a');
        link.style = linkStyle;
        var titleSpan = document.createElement('span');
        titleSpan.innerHTML = feature.properties.title;
        link.append(titleSpan);
        listItem.append(link);
        controlList.append(listItem);
        link.addEventListener('click', function(e) {
          flyToStore(feature);
          createPopUp(feature);

          var activeItem = document.querySelector('li.active');
          if (activeItem) {
            activeItem.classList.remove('active');
          }
          listItem.classList.add('active');
        });
      });
      $('#controls').html(controlList);
    }
  } else {
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
}

function setDetailsTrigger() {
  var details_trigger = '.location-details-trigger';
  $('#gmap').on('click', details_trigger, function() {
    $(details_trigger).colorbox({inline: true, width: '50%', open: true});
  });
}

function flyToStore(currentFeature) {
  gmap.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 15
  });
}

function createPopUp(currentFeature) {
  clearPopUps();
  new mapboxgl.Popup()
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(currentFeature.properties.description)
    .addTo(gmap);
  setDetailsTrigger();
}

function clearPopUps() {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  /** Check if there is already a popup on the map and if so, remove it */
  if (popUps[0]) {
    popUps[0].remove();
  }
}
