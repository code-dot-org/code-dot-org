/* global google */

var gmap,
  markers = {},
  infoWindow,
  remainingWorkshops;

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
  var params = [];

  $.get('/dashboardapi/v1/pd/k5workshops').done(function (data) {
    processPdWorkshops(data);
  });

  $.post('/forms/ProfessionalDevelopmentWorkshop/query', $.param(params), function (response) {
    var results = JSON.parse(response);

    $.each(results.response.docs, function (index, workshop) {
      if (typeof workshop.location_p !== 'undefined') {
        var location = workshop.location_p.split(',');
        var latLng = new google.maps.LatLng(location[0], location[1]);

        // This hash will round the latLngs to 6 decimals.
        var hash = latLng.toUrlValue();

        var infoWindowContent = '';

        if (typeof markers[hash] === 'undefined') {
          infoWindowContent = compileHtml(workshop, true);
          markers[hash] = new google.maps.Marker({
            position: latLng,
            map: gmap,
            title: workshop.location_name_p,
            infoWindowContent: infoWindowContent
          });
          google.maps.event.addListener(markers[hash], "click",
            function (e) {
              infoWindow.setContent(this.get('infoWindowContent'));
              infoWindow.open(gmap, this);
            });
        } else {
          infoWindowContent = compileHtml(workshop, false);
          // Extend existing marker.
          markers[hash].infoWindowContent += infoWindowContent;
        }
      }
    });
  }).fail(displayQueryError).always(addGeocomplete());
}

function processPdWorkshops(workshops) {
  remainingWorkshops = workshops.length;
  $.each(workshops, function (i, workshop) {
    var location = workshop.processed_location;
    var latLng = new google.maps.LatLng(location.latitude, location.longitude);
    var hash = latLng.toUrlValue();

    var infoWindowContent = '';

    if (typeof markers[hash] === 'undefined') {
      infoWindowContent = compileHtmlNew(workshop, true);
      markers[hash] = new google.maps.Marker({
        position: latLng,
        map: gmap,
        title: workshop.location_name,
        infoWindowContent: infoWindowContent
      });
      google.maps.event.addListener(markers[hash], "click",
        function (e) {
          infoWindow.setContent(this.get('infoWindowContent'));
          infoWindow.open(gmap, this);
        });
    } else {
      infoWindowContent = compileHtmlNew(workshop, false);
      // Extend existing marker.
      markers[hash].infoWindowContent += infoWindowContent;
    }

    geolocateComplete();
  });
}

function geolocateComplete() {
  remainingWorkshops--;
  if (remainingWorkshops < 1) {
    addGeocomplete();
  }
}

function compileHtml(workshop, first) {
  // Compile HTML.
  var html = '';

  if (first) {
    html += '<div class="workshop-item workshop-item-first">';
  } else {
    html += '<div class="workshop-item">';
  }

  html += '<div class="workshop-location-name"><strong>' + workshop.location_name_s + '</strong></div>';

  // Add the date(s).
  html += '<div class="workshop-dates">';
  $.each(workshop.dates_ss, function (key, value) {
    html += '<div class="workshop-date" style="white-space: nowrap;">' + value + '</div>';
  });
  html += '</div>';

  if (workshop.id) {
    html += '<div class="workshop-link"><a style="" href="/professional-development-workshops/' + workshop.id + '">Info and Signup</a></div>';
  }

  html += '</div>';

  return html;
}

function compileHtmlNew(workshop, first) {
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

  if (html5_storage_supported() && typeof localStorage['geocomplete'] !== 'undefined') {
    geocomplete_options.location = localStorage['geocomplete'];
  }

  $("#geocomplete").geocomplete(geocomplete_options)
    .bind("geocode:result", function (event, result) {
      gmap.fitBounds(result.geometry.viewport);

      var bounds = gmap.getBounds();
      var marker_found = false;

      while (!marker_found && gmap.getZoom() > 4) {
        $.each(markers, function (index, marker) {
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

function displayQueryError() {
}
