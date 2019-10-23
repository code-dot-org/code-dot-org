import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
/* globals google */

/**
 * A search box that loads a Google Location Search control.
 *
 * Note: Google location search requires the following line to be present in the haml where this component is used:
 * %script{type: "text/javascript", src: "https://maps.googleapis.com/maps/api/js?client=#{CDO.google_maps_client_id}&sensor=true&libraries=places,geometry&v=3.37"}
 */
export default class GoogleSchoolLocationSearchField extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    // If true, this field uses the React controlled input pattern and must
    // have the value/onChange handlers hooked up to work properly.
    // If false, is uncontrolled and used only as a submittable <form> element.
    // @see https://reactpatterns.com/#controlled-input
    isControlledInput: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
    style: PropTypes.object
  };

  value() {
    if (this.props.isControlledInput) {
      return this.props.value;
    }
    return this.searchBoxRef.value;
  }

  componentDidMount() {
    // Gracefully skip initialization for the search control if the needed
    // library isn't available (as in storybook or unit tests).
    if (typeof google !== 'object') {
      return;
    }

    // Docs: https://developers.google.com/maps/documentation/javascript/places-autocomplete#places_searchbox
    const searchBox = new google.maps.places.SearchBox(this.searchBoxRef);
    if (this.props.isControlledInput) {
      searchBox.addListener('places_changed', () => {
        this.props.onChange({target: this.searchBoxRef});
      });
    }
  }

  render() {
    const conditionalProps = this.props.isControlledInput
      ? {
          value: this.props.value,
          onChange: this.props.onChange
        }
      : {};

    return (
      <input
        ref={el => (this.searchBoxRef = el)}
        type="text"
        name={this.props.name}
        placeholder={i18n.schoolLocationSearchPlaceholder()}
        style={this.props.style}
        {...conditionalProps}
      />
    );
  }
}
