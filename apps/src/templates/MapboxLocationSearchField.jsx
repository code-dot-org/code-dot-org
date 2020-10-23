/* globals MapboxGeocoder */
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
/**
 * A search box that loads a Mapbox location search control.
 *
 * Note: Mapbox location search requires the following line to be present in the haml where this component is used:
 *   %script{type: "text/javascript", src: "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.min.js"}
 *   %link{rel: "stylesheet", type: "text/css", href: "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.css"}
 */
export default class MapboxLocationSearchField extends React.Component {
  static propTypes = {
    // Note: if mapboxAccessToken is not defined, then nothing will be rendered.
    mapboxAccessToken: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func
  };

  componentDidMount() {
    // Don't render this mapbox component if this host doesn't have access to mapbox.
    if (!this.props.mapboxAccessToken) {
      return;
    }
    // eslint-disable-next-line no-undef
    const mapboxGeocoder = new MapboxGeocoder({
      accessToken: this.props.mapboxAccessToken,
      types: 'country,region,place,postcode,locality,neighborhood',
      placeholder: i18n.schoolLocationSearchPlaceholder()
    });
    mapboxGeocoder.addTo(`#${this.searchContainerRef.id}`);
    mapboxGeocoder.setInput(this.props.value);
    mapboxGeocoder.on('result', event => {
      const location = event && event.result && event.result.place_name;
      this.props.onChange({target: {value: location}});
    });
  }

  render() {
    return (
      <div
        ref={el => (this.searchContainerRef = el)}
        id="mapbox-location-search-container"
      />
    );
  }
}
