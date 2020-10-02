/* globals mapboxgl, MapboxGeocoder */

import $ from 'jquery';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import colors from '@cdo/apps/util/color';

var map;

$(document).ready(function() {
  initializeMap();
  map.on('load', loadWorkshops);
});

function initializeMap() {
  map = new mapboxgl.Map({
    container: 'gmap',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-95.665, 37.6],
    zoom: 3
  });
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    types: 'country,region,district,postcode,locality,place'
  });
  document.getElementById('geocomplete').appendChild(geocoder.onAdd(map));
}

function loadWorkshops() {
  const deepDiveOnly = $('#properties').attr('data-deep-dive-only');
  let url = '/dashboardapi/v1/pd/k5workshops';
  if (deepDiveOnly !== undefined) {
    url += '?deep_dive_only=1';
  }
  map.addSource('workshops', {
    type: 'geojson',
    data: url,
    cluster: true,
    clusterRadius: 20,
    clusterMaxZoom: 12
  });

  placeClusters();
  placeIntroWorkshops();
  placeDeepDiveWorkshops();
}

function placeClusters() {
  map.addLayer({
    id: 'workshop-clusters',
    type: 'circle',
    source: 'workshops',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': colors['teal'],
      'circle-radius': 20,
      'circle-blur': 0.75
    }
  });
  map.addLayer({
    id: 'workshop-clusters-count',
    type: 'symbol',
    source: 'workshops',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
      'text-allow-overlap': true
    }
  });
  map.on('click', 'workshop-clusters', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['workshop-clusters']
    });
    var clusterId = features[0].properties.cluster_id;
    map
      .getSource('workshops')
      .getClusterExpansionZoom(clusterId, function(err, zoom) {
        if (err) {
          console.log(err);
          return;
        }

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      });
  });
  map.on('mouseenter', 'workshop-clusters', function() {
    map.getCanvas().style.cursor = 'pointer';
  });
}

function placeIntroWorkshops() {
  map.loadImage(
    'https://maps.google.com/mapfiles/kml/paddle/red-blank.png',
    (error, image) => {
      if (error) {
        console.log(error);
        return;
      }
      map.addImage('marker', image);
      map.addLayer({
        id: 'intro-workshops',
        type: 'symbol',
        source: 'workshops',
        filter: [
          'all',
          ['!=', 'subject', SubjectNames.SUBJECT_CSF_201],
          ['!has', 'point_count']
        ],
        layout: {
          'icon-image': 'marker',
          'icon-size': 0.5,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true
        }
      });
    }
  );
  map.on('click', 'intro-workshops', onMarkerClick);
  map.on('mouseenter', 'intro-workshops', function() {
    map.getCanvas().style.cursor = 'pointer';
  });
}

function placeDeepDiveWorkshops() {
  map.loadImage(
    'https://maps.google.com/mapfiles/kml/paddle/red-stars.png',
    (error, image) => {
      if (error) {
        console.log(error);
        return;
      }
      map.addImage('star-marker', image);
      map.addLayer({
        id: 'deep-dive-workshops',
        type: 'symbol',
        source: 'workshops',
        filter: [
          'all',
          ['==', 'subject', SubjectNames.SUBJECT_CSF_201],
          ['!has', 'point_count']
        ],
        layout: {
          'icon-image': 'star-marker',
          'icon-size': 0.5,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true
        }
      });
    }
  );
  map.on('click', 'deep-dive-workshops', onMarkerClick);
  map.on('mouseenter', 'deep-dive-workshops', function() {
    map.getCanvas().style.cursor = 'pointer';
  });
}

function onMarkerClick(e) {
  var coordinates = e.features[0].geometry.coordinates.slice();
  var workshop = e.features[0].properties;
  const description = compileHtml(workshop, false);

  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(map);
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
