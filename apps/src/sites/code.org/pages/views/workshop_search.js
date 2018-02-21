/* globals google */

import $ from "jquery";
import MarkerClusterer from 'node-js-marker-clusterer';
import getScriptData from '@cdo/apps/util/getScriptData';

const markerCustererOptions = {
  imagePath: getScriptData('workshopSearch').imagePath,
  gridSize: 10
};

var gmap,
  markersByLocation = {},
  infoWindow,
  markerClusterer;

$(document).ready(function () {
  initializeMap();
  loadWorkshops();
});

function initializeMap() {
  var mapOptions = {
    center: new google.maps.LatLng(37.6, -95.665),
    zoom: 4,
    minZoom: 2,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  gmap = new google.maps.Map(document.getElementById("gmap"), mapOptions);
  infoWindow = new google.maps.InfoWindow();
}

function loadWorkshops() {
  markerClusterer = new MarkerClusterer(gmap, [], markerCustererOptions);

  $.get('/dashboardapi/v1/pd/k5workshops').done(function (data) {
    processPdWorkshops(data);
  }).always(completeProcessingPdWorkshops);
}

function processPdWorkshops(workshops) {
  $.each(workshops, function (i, workshop) {
    var location = workshop.processed_location;
    var latLng = new google.maps.LatLng(location.latitude, location.longitude);
    var hash = latLng.toUrlValue();

    var infoWindowContent = '';

    if (markersByLocation[hash] === undefined) {
      infoWindowContent = compileHtml(workshop, true);
      markersByLocation[hash] = createNewMarker(latLng, workshop.location_name, infoWindowContent);
    } else {
      // Extend existing marker.
      infoWindowContent = compileHtml(workshop, false);
      markersByLocation[hash].infoWindowContent += infoWindowContent;
    }
  });
}

function createNewMarker(latLng, title, infoWindowContent) {
  var marker = new google.maps.Marker({
    position: latLng,
    map: gmap,
    title: title,
    infoWindowContent: infoWindowContent
  });
  google.maps.event.addListener(marker, "click",
    function () {
      infoWindow.setContent(this.get('infoWindowContent'));
      infoWindow.open(gmap, this);
    });
  markerClusterer.addMarker(marker);
  return marker;
}

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
  html += '<div class="workshop-location-name"><strong>' + workshop.location_name + '</strong></div>';

  // Add the date(s).
  html += '<div class="workshop-dates">';
  $.each(workshop.sessions, function (i, session) {
    html += '<div class="workshop-date" style="white-space: nowrap;">' + session + '</div>';
  });
  html += '</div>';

  var code_studio_root = $('#properties').attr('data-studio-url');
  var url = code_studio_root + "/pd/workshops/" + workshop.id + '/enroll';
  if (workshop.id) {
    html += '<div class="workshop-link"><a style="" href=' + url + '>Info and Signup</a></div>';
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

  $("#geocomplete").geocomplete(geocomplete_options)
  .bind("geocode:result", function (event, result) {
    gmap.fitBounds(result.geometry.viewport);

    var bounds = gmap.getBounds();
    var marker_found = false;

    while (!marker_found && gmap.getZoom() > 4) {
      $.each(markersByLocation, function (index, marker) {
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

  $("#btn-submit").click(function () {
    $("#geocomplete").trigger("geocode");
  });

  $("#btn-reset").click(function () {
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
