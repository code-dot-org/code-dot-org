/*global mapboxgl*/

$(document).ready(function() {
  var map = new mapboxgl.Map({
    container: 'mapbox-map',
    style: 'mapbox://styles/codeorg/cjz36duae88ds1cp7ll7smx6s',
    zoom: 1,
    minZoom: 1,
    center: [-98, 39]
  });

  var popup = null;

  map.dragRotate.disable();

  map.on('load', function() {
    map.on('click', 'hoc-events', function(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var organization_name = e.features[0].properties.organization_name;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      if (popup) {
        popup.remove();
      }
      popup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setText(organization_name)
        .addTo(map);
    });

    map.on('click', 'hoc-special-events', function(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var organization_name = e.features[0].properties.organization_name;
      var event_description = e.features[0].properties.description;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      if (popup) {
        popup.remove();
      }
      popup = new mapboxgl.Popup({closeButton: false})
        .setLngLat(coordinates)
        .setHTML(organization_name + '<br>' + event_description)
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
