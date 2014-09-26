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
              gmap.setZoom(9);
              gmap.setCenter(markers[hash].getPosition());
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
    country: 'us'
  };

  if (html5_storage_supported() && typeof localStorage['geocomplete'] != 'undefined') {
    geocomplete_options.location = localStorage['geocomplete'];
  }

  $("#geocomplete").geocomplete(geocomplete_options)
    .bind("geocode:result", function(event, result){
      gmap.fitBounds(result.geometry.viewport);
      if (html5_storage_supported()) {
        localStorage['geocomplete'] = result.formatted_address;
      }
    });

  $("#btn-submit").click(function(){
    $("#geocomplete").trigger("geocode");
  });

  $("#btn-reset").click(function(){
    $('#geocomplete').val('');
    gmap.setCenter(new google.maps.LatLng(37.6, -95.665));
    gmap.setZoom(4);
    info_window.close();
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
