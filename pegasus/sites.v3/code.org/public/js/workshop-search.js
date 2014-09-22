var gmap,
    markers = [],
    info_window;

$(document).ready(function() {
  initializeMap();
  loadWorkshops();
  addGeocomplete();
});

function initializeMap() {
  var mapOptions = {
    center: new google.maps.LatLng(37.6, -95.665),
    zoom: 4,
    minZoom: 2,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  gmap = new google.maps.Map(document.getElementById("gmap"), mapOptions);
  info_window = new google.maps.InfoWindow();
}

function loadWorkshops() {
  var params = [];

  $.post('/forms/ProfessionalDevelopmentWorkshop/query', $.param(params), function(response) {
    var results = JSON.parse(response);

    $.each(results.response.docs, function(index, workshop) {
      if (typeof workshop.location_p != 'undefined') {
        var location = workshop.location_p.split(',');
        var latLng = new google.maps.LatLng(location[0], location[1]);

        // This hash will round the latLngs to 6 decimals.
        var hash = latLng.toUrlValue();

        var infowindow_content = '';

        if(typeof markers[hash]==='undefined'){
          infowindow_content = compileHtml(workshop, true);
          markers[hash] = new google.maps.Marker({
            position: latLng,
            map: gmap,
            title: workshop.location_name_p,
            infowindow_content: infowindow_content
          });
          google.maps.event.addListener(markers[hash], "click",
            function (e) {
              info_window.setContent(this.get('infowindow_content'));
              info_window.open(gmap, this);
            });
        }
        else {
          infowindow_content = compileHtml(workshop, false);
          // Extend existing marker.
          markers[hash].infowindow_content += infowindow_content;
        }
      }
    });
  }).fail(displayQueryError);
}

function compileHtml(workshop, first) {
  // Compile HTML.
  var html = '';

  if (first) {
    html += '<div class="workshop-item workshop-item-first">';
  }
  else {
    html += '<div class="workshop-item">';
  }

  html += '<div class="workshop-location-name"><strong>' + workshop.location_name_s + '</strong></div>';

  // Add the date(s).
  html += '<div class="workshop-dates">';
  $.each(workshop.dates_ss, function(key, value) {
    html += '<div class="workshop-date" style="white-space: nowrap;">' + value + '</div>';
  });
  html += '</div>';

  if (workshop.id) {
    html += '<div class="workshop-link"><a style="" href="/professional-development-workshops/' + workshop.id + '">More Info</a></div>';
  }

  html += '</div>';

  return html;
}

function addGeocomplete() {
  var geocomplete_options = {
    map: '#gmap',
    country: 'us',
    markerOptions: {
      visible: false
    }
  };

  $("#geocomplete").geocomplete(geocomplete_options);

  $("#btn-submit").click(function(){
    $("#geocomplete").trigger("geocode");
  });
}

function displayQueryError() {
}
