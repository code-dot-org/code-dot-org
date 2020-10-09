/* globals google, mapboxgl, MapboxGeocoder */

import $ from 'jquery';
import colors from '@cdo/apps/util/color';
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
  if (window.location.search.includes('mapbox')) {
    $('#gmap').hide();
    $('#mapbox-map').show();
    $('#geocomplete').hide();
    $('#geocomplete-form').hide();
    $('#mapboxgeocoder').show();
    initializeMapboxMap();
    map.on('load', loadMapboxWorkshops);
  } else {
    initializeGoogleMap();
    loadGoogleMapWorkshops();
  }
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

  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(map);
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
  });

  html += '</div>';

  return html;
}

function initializeGoogleMap() {
  var mapOptions = {
    center: new google.maps.LatLng(37.6, -95.665),
    zoom: 4,
    minZoom: 2,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('gmap'), mapOptions);
  infoWindow = new google.maps.InfoWindow();
}

function loadGoogleMapWorkshops() {
  markerClusterer = new MarkerClusterer(map, [], markerCustererOptions);

  const deepDiveOnly = $('#properties').attr('data-deep-dive-only');
  let url = '/dashboardapi/v1/pd/k5workshops';
  if (deepDiveOnly !== undefined) {
    url += '?deep_dive_only=1';
  }

  $.get(url)
    .done(function(data) {
      processPdWorkshops(data);
    })
    .always(completeProcessingPdWorkshops);
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
    map: map,
    title: title,
    infoWindowContent: infoWindowContent,
    icon: iconForSubject(subject)
  });
  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(this.get('infoWindowContent'));
    infoWindow.open(map, this);
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
  $.each(workshop.sessions, function(i, session) {
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
      map.fitBounds(result.geometry.viewport);

      var bounds = map.getBounds();
      var marker_found = false;

      while (!marker_found && map.getZoom() > 4) {
        $.each(markersByLocation, function(index, marker) {
          if (bounds.contains(marker.getPosition())) {
            marker_found = true;
          }
        });

        if (!marker_found) {
          map.setZoom(map.getZoom() - 1);
          bounds = map.getBounds();
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
    map.setCenter(new google.maps.LatLng(37.6, -95.665));
    map.setZoom(4);
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
