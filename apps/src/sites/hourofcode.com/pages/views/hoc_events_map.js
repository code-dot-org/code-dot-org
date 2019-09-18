/*global mapboxgl*/

$(document).ready(function() {
  // We keep some style elements as a Mapbox style for simplicity.
  const stylePath = 'mapbox://styles/codeorg/cjz36duae88ds1cp7ll7smx6s';
  var map = new mapboxgl.Map({
    container: 'mapbox-map',
    style: stylePath,
    zoom: 1,
    minZoom: 1,
    center: [-98, 39]
  });

  var popup = null;

  map.dragRotate.disable();
  map.scrollZoom.disable();
  map.dragPan.disable();

  // Ensure that if the map is zoomed out such that multiple
  // copies of the point are visible, the popup appears
  // over the point clicked on.
  function getPopupCoordinates(clickLngLat, featureCoordinates) {
    var normalizedCoordinates = featureCoordinates;
    while (Math.abs(clickLngLat.lng - normalizedCoordinates[0]) > 180) {
      normalizedCoordinates[0] +=
        clickLngLat.lng > normalizedCoordinates[0] ? 360 : -360;
    }
    return normalizedCoordinates;
  }

  map.on('load', function() {
    map.addSource('hoctiles', {
      type: 'vector',
      url: 'mapbox://codeorg.hoctiles'
    });

    // The order we add layers matters here as layers are added on top of each
    // other. We want special events to be on top of the other events, so we
    // add the special events layer second.
    map.addLayer({
      id: 'hoc-events',
      type: 'symbol',
      source: 'hoctiles',
      'source-layer': 'hoc',
      layout: {
        visibility: 'visible',
        'icon-allow-overlap': true,
        'icon-size': 1,
        'icon-image': 'circle-11-orange'
      },
      filter: ['!=', 'review', 'approved']
    });

    map.addLayer({
      id: 'hoc-special-events',
      type: 'symbol',
      source: 'hoctiles',
      'source-layer': 'hoc',
      layout: {
        visibility: 'visible',
        'icon-allow-overlap': true,
        'icon-size': 1.1,
        'icon-image': 'marker-15-red'
      },
      filter: ['==', 'review', 'approved']
    });

    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.addControl(
      new mapboxgl.NavigationControl({showCompass: false}),
      'bottom-right'
    );

    var legend = document.createElement('div');
    legend.id = 'inmaplegend';
    legend.className = 'inmap-mapbox-legend';
    legend.index = 1;
    $('#belowmaplegend div')
      .clone()
      .appendTo(legend);
    document.getElementById('mapbox-map').appendChild(legend);

    function enableMouseControls() {
      map.scrollZoom.enable();
      map.dragPan.enable();
    }

    // Enable mouse controls when the map is clicked
    map.on('click', function(e) {
      enableMouseControls();
    });
    // Enable mouse controls when the zoom (+/-) buttons are pressed
    map.on('zoom', function(e) {
      enableMouseControls();
    });
    // Enable mouse controls when we go full screen
    map.on('resize', function(e) {
      enableMouseControls();
    });

    map.on('click', 'hoc-events', function(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var organizationName = e.features[0].properties.organization_name;
      var city = e.features[0].properties.city;

      if (popup) {
        popup.remove();
      }
      const popupText =
        organizationName + (city.length > 0 ? ' (' + city + ')' : '');
      popup = new mapboxgl.Popup({closeButton: false})
        .setLngLat(getPopupCoordinates(e.lngLat, coordinates))
        .setText(popupText)
        .addTo(map);
    });

    map.on('click', 'hoc-special-events', function(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var organizationName = e.features[0].properties.organization_name;
      var city = e.features[0].properties.city;
      var event_description = e.features[0].properties.description;

      if (popup) {
        popup.remove();
      }
      const popupText =
        organizationName +
        (city.length > 0 ? ' (' + city + ')' : '') +
        '<br>' +
        event_description;
      popup = new mapboxgl.Popup({closeButton: false})
        .setLngLat(getPopupCoordinates(e.lngLat, coordinates))
        .setHTML(popupText)
        .addTo(map);
    });

    map.on('mouseenter', 'hoc-events', function() {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseenter', 'hoc-special-events', function() {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'hoc-events', function() {
      map.getCanvas().style.cursor = '';
    });

    map.on('mouseleave', 'hoc-special-events', function() {
      map.getCanvas().style.cursor = '';
    });
  });
});
