/* exported sendEmail */
/* global mapboxgl, MapboxGeocoder */

var map_loc;
var selectize;

var mapboxMap;
var mapboxGeocoder;
var mapboxStores;

var firstRetrievalDone = false;

// This is for older browsers that don't support remove.
if (!("remove" in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

$(document).ready(function() {
  initializeMap();
  $("#contact-volunteer-form select").selectize();
});

$(function() {
  selectize = $("#volunteer-search-facets select").selectize({
    plugins: ["remove_button"]
  });

  // Trigger query when a facet is changed.
  $("#volunteer-search-facets")
    .find("select")
    .change(function() {
      initializeMap();
    });

  // Only the local volunteer search has a geocoder text input.
  if (window.location.pathname.indexOf("/volunteer/local") !== -1) {
    mapboxGeocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      types: "country,region,place,postcode,locality,neighborhood"
    });

    mapboxGeocoder.addTo("#mapbox-geocoder");
    mapboxGeocoder.on("result", function(result) {
      const coordinates = result.result.geometry.coordinates;
      map_loc = coordinates[1] + "," + coordinates[0];
      resetFacets();
      initializeMap();
    });
  }
});

function initializeMap() {
  var form_data = $("#volunteer-search-form").serializeArray();

  // Clear the location details.
  $("#location-details").html("");

  var params = getParams(form_data);
  sendQuery(params);
}

function getParams(form_data) {
  var params = [];

  if (window.location.pathname.indexOf("/volunteer/remote") !== -1) {
    map_loc = "37.6,-95.665";

    params.push({
      name: "distance",
      value: 10500
    });

    params.push({
      name: "num_volunteers",
      value: 1000
    });

    params.push({
      name: "location_flexibility_ss[]",
      value: "remote"
    });
  }

  // Default showing US results
  if (!map_loc) {
    // Westlake park, Seattle
    map_loc = "47.611089,-122.337034";
  }

  params.push({
    name: "coordinates",
    value: map_loc
  });

  $.each(form_data, function(key, field) {
    if (field.value !== "" && field.name !== "location") {
      params.push(field);
    }
  });

  return params;
}

function sendQuery(params) {
  $.post(
    "/forms/VolunteerEngineerSubmission2015/query",
    $.param(params),
    function(response) {
      var locations = getLocations(response);
      updateResults(locations);
    }
  ).fail(displayQueryError);
}

function updateResults(locations) {
  if (locations.length > 0) {
    $("#controls").html("");
  } else {
    displayNoResults();
  }

  // First retrieval shows pins across the entire US.  Subsequent retrievals
  // show pins much closer to a specified location.  For this reason, we don't
  // want to show the filter options at first, but only after a location has
  // been specified by the user.
  if (firstRetrievalDone) {
    $(".filter-options").fadeIn();
  } else {
    firstRetrievalDone = true;
  }

  loadMap(locations);
}

function getLocations(results) {
  var locations = [];

  if (results.response) {
    var volunteers = results.response.docs; // The actual volunteers that were returned by Solr.
    var volunteers_count = volunteers.length;

    for (var index = 0; index < volunteers_count; index++) {
      var coordinates = volunteers[index].location_p.split(",");
      // 0.01 degree is approximately 1km. randomize within this 1km to avoid showing exact addresses
      var lat = coordinates[0] - 0.005 + 0.01 * Math.random();
      var lon = coordinates[1] - 0.005 + 0.01 * Math.random();
      var title = escapeHtml(volunteers[index].name_s);
      var id = volunteers[index].id;
      var html = compileHTML(index, volunteers[index]);
      var contact_title = compileContact(index, volunteers[index]);
      var contact_link = `<a id="contact-trigger-${index}" class="contact-trigger" onclick="return contactVolunteer(${id}, '${title}')">Contact</a>`;

      var location = {
        lat: lat,
        lon: lon,
        title: title,
        id: id,
        contact_title: contact_title,
        html: html + contact_link,
        zoom: 10
      };

      locations.push(location);
    }
  }

  return locations;
}

function resetFacets() {
  $.each(selectize, function(key, select) {
    select.selectize.clear();
    select.selectize.refreshOptions(false);
  });
}

function displayNoResults() {
  $("#controls").html(
    '<p>Sorry! No volunteers were found with that search criteria. <a href="/volunteer/remote">Find a volunteer who can video chat</a> with your classroom and inspire your students.</p>'
  );

  // If a facet has a value, show the facets.
  var form_data = $("#volunteer-search-form").serializeArray();
  $.each(form_data, function(key, field) {
    if (field.name !== "location" && field.value) {
    }
  });
}

function displayQueryError() {
  $("#volunteer-search-results").hide();
  $("#volunteer-search-error")
    .html("<p>An error occurred. Please try your search again.</p>")
    .show();
}

function loadMap(locations) {
  var coordinates = map_loc.split(",");
  var lat = coordinates[0];
  var lng = coordinates[1];

  // Mapbox specific.

  $("#mapbox-container").show();

  var mapOptions = {
    mapOptions: {
      setCenter: [lat, lng],
      zoom: 12
    },
    controls_type: "list",
    controls_on_map: false
  };

  $("#mapbox-listings").html("");

  if (locations.length > 0) {
    mapOptions.locations = locations;
  }

  mapboxMap = new mapboxgl.Map({
    container: "mapbox",
    style: "mapbox://styles/codeorg/cjyudafoo004w1cnpaeq8a0lz",
    center: [lng, lat],
    zoom: 1
  });

  mapboxStores = {
    type: "FeatureCollection",
    features: []
  };

  mapboxMap.on("load", function() {
    mapboxMap.loadImage(
      "/images/map-markers/dot-marker.png",
      (error, image) => {
        if (error) {
          console.log(error);
          return;
        }

        mapboxMap.addImage("dot-marker", image);
        if (mapOptions.locations && mapOptions.locations.length > 0) {
          for (var i = 0; i < mapOptions.locations.length; i++) {
            const location = mapOptions.locations[i];
            const feature = {
              type: "Feature",
              properties: {
                id: i,
                description: location.html,
                title: location.title
              },
              geometry: {
                type: "Point",
                coordinates: [location.lon, location.lat]
              }
            };
            mapboxStores.features.push(feature);
          }
        }
        mapboxMap.addSource("places", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: mapboxStores.features
          }
        });

        // Add a layer showing the places.
        mapboxMap.addLayer({
          id: "places",
          type: "symbol",
          source: "places",
          layout: {
            "icon-image": "dot-marker",
            "icon-size": 1.1,
            "icon-allow-overlap": true
          }
        });
        mapboxMap.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          "bottom-right"
        );

        if (mapOptions.locations && mapOptions.locations.length > 0) {
          addMarkers(mapboxStores);

          if (mapOptions.locations.length > 1) {
            // Set up sidebar.
            buildLocationList(mapboxStores);

            // And zoom to show the current set of markers.
            zoomToCurrentMarkers();
          } else if (mapOptions.locations.length === 1) {
            // Just fly to the single marker.
            flyToStore(mapboxStores.features[0]);
          }
        }
      }
    );
  });

  mapboxMap.on("click", "places", function(e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(mapboxMap);
  });
}

/**
 * Add a listing for each store to the sidebar.
 **/
function buildLocationList(data) {
  var listings = document.getElementById("mapbox-listings");

  // First, a "View All" entry.
  var listingViewAll = listings.appendChild(document.createElement("div"));
  listingViewAll.id = "listing-viewall";
  listingViewAll.className = "item";

  var linkViewAll = listingViewAll.appendChild(document.createElement("a"));
  linkViewAll.href = "#";
  linkViewAll.className = "title";
  linkViewAll.id = "link-viewall";
  linkViewAll.innerHTML = "View All";
  linkViewAll.addEventListener("click", function(e) {
    clearPopUp();
    zoomToCurrentMarkers();
    e.preventDefault();
  });

  // Next, an entry for each marker.
  data.features.forEach(function(store, i) {
    /**
     * Create a shortcut for `store.properties`,
     * which will be used several times below.
     **/
    var prop = store.properties;

    /* Add a new listing section to the sidebar. */
    var listing = listings.appendChild(document.createElement("div"));
    /* Assign a unique `id` to the listing. */
    listing.id = "listing-" + prop.id;
    /* Assign the `item` class to each listing for styling. */
    listing.className = "item";

    /* Add the link to the individual listing created above. */
    var link = listing.appendChild(document.createElement("a"));
    link.href = "#";
    link.className = "title";
    link.id = "link-" + prop.id;
    link.innerHTML = prop.title;

    /**
     * Listen to the element and when it is clicked, do four things:
     * 1. Update the `currentFeature` to the store associated with the clicked link
     * 2. Fly to the point
     * 3. Close all other popups and display popup for clicked store
     * 4. Highlight listing in sidebar (and remove highlight for all other listings)
     **/
    link.addEventListener("click", function(e) {
      for (var i = 0; i < data.features.length; i++) {
        if (this.id === "link-" + data.features[i].properties.id) {
          var clickedListing = data.features[i];
          flyToStore(clickedListing);
          createPopUp(clickedListing);
        }
      }
      var activeItem = document.getElementsByClassName("active");
      if (activeItem[0]) {
        activeItem[0].classList.remove("active");
      }
      this.parentNode.classList.add("active");
      e.preventDefault();
    });
  });
}

function flyToStore(currentFeature) {
  mapboxMap.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 15
  });
}

function createPopUp(currentFeature) {
  clearPopUp();

  new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(currentFeature.properties.description)
    .addTo(mapboxMap);
}

function clearPopUp() {
  var popUps = document.getElementsByClassName("mapboxgl-popup");
  if (popUps[0]) {
    popUps[0].remove();
  }
}

function addMarkers(stores) {
  /* For each feature in the GeoJSON object above: */
  stores.features.forEach(function(marker) {
    /* Create a div element for the marker. */
    var el = document.createElement("div");
    /* Assign a unique `id` to the marker. */
    el.id = "marker-" + marker.properties.id;
    /* Assign the `marker` class to each marker for styling. */
    el.className = "marker";

    /**
     * Create a marker using the div element
     * defined above and add it to the map.
     **/
    //const marker =
    new mapboxgl.Marker(el, { offset: [0, -23] })
      .setLngLat(marker.geometry.coordinates)
      .addTo(mapboxMap);

    el.addEventListener("click", function(e) {
      /* Fly to the point */
      flyToStore(marker);
      /* Close all other popups and display popup for clicked store */
      createPopUp(marker);
      /* Highlight listing in sidebar */
      var activeItem = document.getElementsByClassName("active");
      e.stopPropagation();
      if (activeItem[0]) {
        activeItem[0].classList.remove("active");
      }
      var listing = document.getElementById("listing-" + marker.properties.id);
      listing.classList.add("active");
    });
  });
}

function zoomToCurrentMarkers() {
  // Note: if there's only one marker, then we zoom too far, so we don't want
  // this function called in that case.

  // Let's zoom to the markers we just added.
  var bounds = new mapboxgl.LngLatBounds();
  mapboxStores.features.forEach(function(feature) {
    bounds.extend(feature.geometry.coordinates);
  });
  mapboxMap.fitBounds(bounds, { padding: 50 });
}

function createHTMLElement(tag, attributes, text) {
  let elem = document.createElement(tag);

  Object.keys(attributes || {}).forEach(key => {
    elem.setAttribute(key, attributes[key]);
  });

  if (text) {
    elem.appendChild(document.createTextNode(text));
  }

  return elem;
}

function createMapEntryDetail(elements) {
  let div = createHTMLElement("div", {
    class: "profile-detail entry-detail"
  });

  elements.forEach(elem => {
    div.appendChild(elem);
  });

  return div;
}

function hasContent(value) {
  return value && value !== "null";
}

function compileHTML(index, location) {
  let html = createHTMLElement("div");

  html.appendChild(
    createMapEntryDetail([
      createHTMLElement("h3", { class: "entry-detail" }, location.name_s)
    ])
  );

  if (hasContent(location.company_s)) {
    html.appendChild(
      createMapEntryDetail([document.createTextNode(location.company_s)])
    );
  }

  if (hasContent(location.experience_s)) {
    html.appendChild(
      createMapEntryDetail([
        createHTMLElement("strong", null, "Experience:"),
        document.createTextNode(" " + i18n(location.experience_s))
      ])
    );
  }

  if (hasContent(location.location_flexibility_ss)) {
    location.location_flexibility_ss.forEach(function(field, index) {
      location.location_flexibility_ss[index] = i18n("location_" + field);
    });

    html.appendChild(
      createMapEntryDetail([
        createHTMLElement("strong", null, "How I can help:"),
        document.createTextNode(
          " " + location.location_flexibility_ss.join(", ")
        )
      ])
    );
  }

  if (hasContent(location.description_s)) {
    html.appendChild(
      createMapEntryDetail([
        createHTMLElement("strong", null, "About me:"),
        document.createTextNode(" " + location.description_s)
      ])
    );
  }

  if (hasContent(location.linkedin_s)) {
    if (!location.linkedin_s.match(/^https?:\/\//i)) {
      location.linkedin_s = "http://" + location.linkedin_s;
    }

    html.appendChild(
      createMapEntryDetail([
        createHTMLElement("strong", null, "LinkedIn profile:"),
        document.createTextNode(" " + location.linkedin_s)
      ])
    );
  }

  if (hasContent(location.facebook_s)) {
    if (!location.facebook_s.match(/^https?:\/\//i)) {
      location.facebook_s = "http://" + location.facebook_s;
    }

    html.appendChild(
      createMapEntryDetail([
        createHTMLElement("strong", null, "Facebook profile:"),
        document.createTextNode(" " + location.facebook_s)
      ])
    );
  }

  return html.innerHTML;
}

function compileContact(index, location) {
  var details = location.name_s + " (" + i18n(location.experience_s) + ")";
  var htmlStr = createHTMLElement(
    "div",
    {
      id: "addressee-details-" + index
    },
    details
  ).outerHTML;

  $("#allnames").append(htmlStr);

  return htmlStr;
}

/* eslint-disable no-unused-vars */
function contactVolunteer(id, name) {
  $("#name").text(name);
  $("#name").show();
  $("#volunteer-contact").show();
  $("#success-message").hide();
  $("#error-message").hide();
  adjustScroll("volunteer-contact");
  $("#volunteer-id").val(id);

  return false;
}

function processResponse(data) {
  $("#error-message").hide();
  $("#success-message").show();
}

function processError(data) {
  $(".has-error").removeClass("has-error");

  var errors = Object.keys(data.responseJSON);
  var errors_count = errors.length;

  for (var i = 0; i < errors_count; ++i) {
    var error_id = "#volunteer-contact-" + errors[i].replace(/_/g, "-");
    error_id = error_id.replace(/-[sb]s?$/, "");
    $(error_id)
      .parents(".form-group")
      .addClass("has-error");
  }

  var error =
    '<font color="#a94442">An error occurred. All fields are required. Please check that all fields have been filled out properly.</font>';
  $("#error-message")
    .html(error)
    .hide()
    .fadeTo("normal", 1);
  $("#success-message").hide();
}

function sendEmail(data) {
  var typeTaskSelected = $("#volunteer-type-task input:checked").length > 0;
  if (typeTaskSelected) {
    $.ajax({
      url: "/forms/VolunteerContact2015",
      type: "post",
      dataType: "json",
      data: $("#contact-volunteer-form").serialize()
    })
      .done(processResponse)
      .fail(processError);
  } else {
    var error =
      '<font color="#a94442">Please select at least one way for the volunteer to help.</font>';
    $("#error-message")
      .html(error)
      .show();
  }

  return false;
}
/* eslint-enable no-unused-vars */

function adjustScroll(destination) {
  $("html, body").animate(
    {
      scrollTop: $("#" + destination).offset().top
    },
    1000
  );
}

function i18n(token) {
  var labels = {
    unspecified: "Unspecified",
    tech_company: "Non-technical",
    university_student_or_researcher: "University CS Student",
    software_professional: "Technical Professional",
    location_onsite: "Classroom visit",
    location_remote: "Remotely"
  };

  return labels[token];
}

/**
 * Replaces special characters in string by HTML entities.
 * List of special characters is taken from
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 *
 * This is a copy of the same function from @cdo/apps/src/utils.js.
 *
 * @param {string} unsafe - The string to escape.
 * @returns {string} Escaped string. Returns an empty string if input is null or undefined.
 */
function escapeHtml(unsafe) {
  return unsafe
    ? unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/\//g, "&#47;")
    : "";
}
