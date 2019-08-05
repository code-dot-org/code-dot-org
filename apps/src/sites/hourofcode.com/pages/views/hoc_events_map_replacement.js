/*global mapboxgl*/

$(document).ready(function() {
  var map = new mapboxgl.Map({
    container: 'mapbox-map',
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 1,
    minZoom: 1,
    center: [-98, 39]
  });
  map.dragRotate.disable();

  map.on('load', function() {
    map.addLayer({
      id: 'hoc-points',
      type: 'circle',
      source: {
        type: 'vector',
        url: 'mapbox://codeorg.hoctiles'
      },
      'source-layer': 'hoc',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'circle-radius': 5,
        'circle-color': [
          'match',
          ['get', 'review'],
          'approved',
          '#55D5D5',
          /* other */ '#CC9966'
        ],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#000000'
      }
    });

    map.on('click', 'hoc-points', function(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var organization_name = e.features[0].properties.organization_name;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setText(organization_name)
        .addTo(map);
    });

    map.on('mouseenter', 'hoc-points', function() {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'hoc-points', function() {
      map.getCanvas().style.cursor = '';
    });
  });
});
