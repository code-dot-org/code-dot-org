/* globals google, mapboxgl */

import $ from 'jquery';
import MarkerClusterer from 'node-js-marker-clusterer';
import getScriptData from '@cdo/apps/util/getScriptData';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

const markerCustererOptions = {
  imagePath: getScriptData('workshopSearch').imagePath,
  gridSize: 10
};

var map,
  markersByLocation = {},
  infoWindow,
  markerClusterer;

$(document).ready(function() {
  initializeMap();
  map.on('load', loadWorkshops);
});

function initializeMap() {
  /*var mapOptions = {
    center: new google.maps.LatLng(37.6, -95.665),
    zoom: 4,
    minZoom: 2,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  gmap = new google.maps.Map(document.getElementById('gmap'), mapOptions);
  infoWindow = new google.maps.InfoWindow();*/
  map = new mapboxgl.Map({
    container: 'gmap',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-95.665, 37.6],
    zoom: 4
  });
}

function loadWorkshops() {
  //markerClusterer = new MarkerClusterer(gmap, [], markerCustererOptions);

  const deepDiveOnly = $('#properties').attr('data-deep-dive-only');
  let url = '/dashboardapi/v1/pd/k5workshops';
  if (deepDiveOnly !== undefined) {
    url += '?deep_dive_only=1';
  }
  map.addSource('workshops', {
    type: 'geojson',
    data: url
  });
  map.addLayer({
    id: 'workshops',
    type: 'circle',
    source: 'workshops',
    paint: {
      'circle-color': 'blue'
    }
  });
  map.on('click', 'workshops', e => {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var workshop = e.features[0].properties;
    const description = compileHtml(workshop, false);

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });
  map.on('mouseenter', 'places', function () {
    map.getCanvas().style.cursor = 'pointer';
  });
}

function processPdWorkshops(workshops) {
  $.each(workshops, function(i, workshop) {
    var location = workshop.processed_location;
    var latLng = new google.maps.LatLng(location.latitude, location.longitude);
    var hash = latLng.toUrlValue();

    var infoWindowContent = '';

    if (markersByLocation[hash] === undefined) {
      infoWindowContent = compileHtml(workshop, true);
      markersByLocation[hash] = createNewMarker(
        latLng,
        workshop.location_name,
        infoWindowContent,
        workshop.subject
      );
    } else {
      // Extend existing marker.
      infoWindowContent = compileHtml(workshop, false);
      markersByLocation[hash].infoWindowContent += infoWindowContent;
      // Upgrade any marker containing a deep dive workshop to the deep dive icon
      if (workshop.subject === SubjectNames.SUBJECT_CSF_201) {
        markersByLocation[hash].icon = iconForSubject(workshop.subject);
      }
    }
  });
}

function createNewMarker(latLng, title, infoWindowContent, subject) {
  var marker = new google.maps.Marker({
    position: latLng,
    map: gmap,
    title: title,
    infoWindowContent: infoWindowContent,
    icon: iconForSubject(subject)
  });
  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(this.get('infoWindowContent'));
    infoWindow.open(gmap, this);
  });
  markerClusterer.addMarker(marker);
  return marker;
}

const iconForSubject = subject => ({
  url:
    subject === SubjectNames.SUBJECT_CSF_201
      ? 'https://maps.google.com/mapfiles/kml/paddle/red-stars.png'
      : 'https://maps.google.com/mapfiles/kml/paddle/red-blank.png',
  scaledSize: new google.maps.Size(40, 40)
});

function completeProcessingPdWorkshops() {
  addGeocomplete();
}

function compileHtml(workshop, first) {
  // Compile HTML.
  var html = '';

  if (first) {
    html += '<div class="workshop-item workshop-item-first">';
  } else {
    html += '<div class="workshop-item">';
  }
  html +=
    '<div class="workshop-location-name"><strong>' +
    workshop.location_name +
    '</strong></div>';

  // Add the workshop subject
  html +=
    '<div class="workshop-subject">' + workshop.subject + ' Workshop</div>';

  // Add the date(s).
  html += '<div class="workshop-dates">';
  const sessions = JSON.parse(workshop.sessions);
  $.each(sessions, function(i, session) {
    html +=
      '<div class="workshop-date" style="white-space: nowrap;">' +
      session +
      '</div>';
  });
  html += '</div>';

  var code_studio_root = $('#properties').attr('data-studio-url');
  var url = code_studio_root + '/pd/workshops/' + workshop.id + '/enroll';
  if (workshop.id) {
    html +=
      '<div class="workshop-link"><a style="" href=' +
      url +
      '>Info and Signup</a></div>';
  }
  html += '</div>';

  return html;
}

function addGeocomplete() {
  var geocomplete_options = {
    country: 'us'
  };

  if (html5_storage_supported() && localStorage['geocomplete'] !== undefined) {
    geocomplete_options.location = localStorage['geocomplete'];
  }

  $('#geocomplete')
    .geocomplete(geocomplete_options)
    .bind('geocode:result', function(event, result) {
      gmap.fitBounds(result.geometry.viewport);

      var bounds = gmap.getBounds();
      var marker_found = false;

      while (!marker_found && gmap.getZoom() > 4) {
        $.each(markersByLocation, function(index, marker) {
          if (bounds.contains(marker.getPosition())) {
            marker_found = true;
          }
        });

        if (!marker_found) {
          gmap.setZoom(gmap.getZoom() - 1);
          bounds = gmap.getBounds();
        }
      }

      if (html5_storage_supported()) {
        localStorage['geocomplete'] = result.formatted_address;
      }
    });

  $('#btn-submit').click(function() {
    $('#geocomplete').trigger('geocode');
  });

  $('#btn-reset').click(function() {
    $('#geocomplete').val('');
    gmap.setCenter(new google.maps.LatLng(37.6, -95.665));
    gmap.setZoom(4);
    infoWindow.close();
    if (html5_storage_supported()) {
      localStorage.removeItem('geocomplete');
    }
  });
}

function html5_storage_supported() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}
