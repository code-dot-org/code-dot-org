/* globals mapboxgl, MapboxGeocoder */

import $ from 'jquery';
import colors from '@cdo/apps/util/color';

var map;

$(document).ready(function() {
  initializeMapboxMap();
  map.on('load', loadMapboxWorkshops);
});

function initializeMapboxMap() {
  map = new mapboxgl.Map({
    container: 'mapbox-map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-95.665, 37.6],
    zoom: 3
  });

  map.dragRotate.disable();
  map.scrollZoom.disable();
  map.dragPan.disable();
  map.addControl(
    new mapboxgl.NavigationControl({showCompass: false}),
    'bottom-right'
  );
  const enableMouseControls = () => {
    map.scrollZoom.enable();
    map.dragPan.enable();
  };
  // Enable mouse controls when the map is clicked
  map.on('click', enableMouseControls);
  // Enable mouse controls when the zoom (+/-) buttons are pressed
  map.on('zoom', enableMouseControls);

  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    types: 'country,region,district,postcode,locality,place'
  });
  document.getElementById('mapboxgeocoder').appendChild(geocoder.onAdd(map));
}

function loadMapboxWorkshops() {
  const deepDiveOnly = $('#properties').attr('data-deep-dive-only');
  let url = '/dashboardapi/v1/pd/k5workshops?geojson=1';
  if (deepDiveOnly !== undefined) {
    url += '&deep_dive_only=1';
  }
  map.addSource('workshops', {
    type: 'geojson',
    data: url,
    cluster: true,
    clusterRadius: 20,
    clusterMaxZoom: 12,
    clusterProperties: {
      clustered_workshop_count: ['+', ['get', 'workshop_count']]
    }
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
      'circle-color': colors.purple,
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
      'text-field': ['get', 'clustered_workshop_count'],
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
  map.loadImage('/images/map-markers/blank-marker.png', (error, image) => {
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
        ['==', 'show_deep_dive_marker', 'false'],
        ['!has', 'point_count']
      ],
      layout: {
        'icon-image': 'marker',
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true
      }
    });
  });
  map.on('click', 'intro-workshops', onMarkerClick);
  map.on('mouseenter', 'intro-workshops', function() {
    map.getCanvas().style.cursor = 'pointer';
  });
}

function placeDeepDiveWorkshops() {
  map.loadImage('/images/map-markers/star-marker.png', (error, image) => {
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
        ['==', 'show_deep_dive_marker', 'true'],
        ['!has', 'point_count']
      ],
      layout: {
        'icon-image': 'star-marker',
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true
      }
    });
  });
  map.on('click', 'deep-dive-workshops', onMarkerClick);
  map.on('mouseenter', 'deep-dive-workshops', function() {
    map.getCanvas().style.cursor = 'pointer';
  });
}

function onMarkerClick(e) {
  var coordinates = e.features[0].geometry.coordinates.slice();
  var workshops = JSON.parse(e.features[0].properties['workshops']);
  const description = compileMapboxPopupHtml(workshops, false);

  const popup = new mapboxgl.Popup({className: 'popup'})
    .setLngLat(coordinates)
    .setHTML(description);
  popup.addTo(map);
}

function compileMapboxPopupHtml(workshops, first) {
  // Compile HTML.
  var html = '';

  workshops.forEach((workshop, i) => {
    if (i === 0) {
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
    const sessions = workshop.sessions;
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
  });

  return html;
}
