/* global mapboxgl */
import PropTypes from 'prop-types';
import $ from 'jquery';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class CensusMapInfoWindow extends Component {
  static propTypes = {
    onTakeSurveyClick: PropTypes.func.isRequired,
    schoolId: PropTypes.string.isRequired,
    schoolName: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    teachesCs: PropTypes.string.isRequired
  };

  render() {
    let censusMessage;
    let missingCensusData = false;
    let color = '';

    switch (this.props.teachesCs) {
      case 'YES':
        censusMessage = 'We believe this school offers Computer Science.';
        color = 'green';
        break;
      case 'NO':
        censusMessage =
          'We believe this school offers limited or no Computer Science opportunities.';
        color = 'blue';
        break;
      case 'HISTORICAL_YES':
        censusMessage =
          'We believe this school historically offered Computer Science.';
        color = 'green';
        break;
      case 'HISTORICAL_NO':
        censusMessage =
          'We believe this school historically offered limited or no Computer Science opportunities.';
        color = 'blue';
        break;
      case 'MAYBE':
      case 'HISTORICAL_MAYBE':
        censusMessage = 'We have conflicting data for this school.';
        color = 'yellow';
        break;
      default:
        censusMessage = 'We need data for this school.';
        missingCensusData = true;
        color = 'white';
    }

    const schoolDropdownOption = {
      value: this.props.schoolId,
      label: `${this.props.schoolName} - ${this.props.city}, ${
        this.props.state
      }`,
      school: {
        nces_id: this.props.schoolId,
        name: this.props.schoolName,
        city: this.props.city,
        state: this.props.state,
        latitude: this.props.location.split(',')[0],
        longitude: this.props.location.split(',')[1]
      }
    };

    const colorClass = `color-small ${color}`;

    return (
      <div id="census-info-window" className="census-info-window">
        <h4>
          <b>{this.props.schoolName}</b>
          <br />({this.props.city}, {this.props.state})
        </h4>
        <hr />
        <div className="census-message">
          <div className={colorClass} />
          {censusMessage}
          {!missingCensusData && (
            <span>
              &nbsp;
              <a href="/yourschool/about" target="_blank">
                (Why?)
              </a>
            </span>
          )}
        </div>
        <div className="button-container">
          <div className="button-link-div">
            <a
              onClick={() =>
                this.props.onTakeSurveyClick(schoolDropdownOption, false)
              }
            >
              <div className="button">
                <div className="button-text">
                  Take the survey for this school
                </div>
              </div>
            </a>
          </div>
          <div className="button-link-div">
            <a href="/yourschool/letter" target="_blank">
              <div className="button">
                <div className="button-text">
                  Send the survey to a teacher at this school
                </div>
              </div>
            </a>
          </div>
        </div>
        {!missingCensusData && (
          <div className="inaccuracy-link">
            <a
              onClick={() =>
                this.props.onTakeSurveyClick(schoolDropdownOption, true)
              }
            >
              I believe that the categorization for this school is inaccurate.
            </a>
          </div>
        )}
      </div>
    );
  }
}

export default class CensusMapReplacement extends Component {
  static propTypes = {
    onTakeSurveyClick: PropTypes.func.isRequired,
    school: PropTypes.object
  };

  map = undefined;
  popup = undefined;
  scrollwheelOption = false;
  draggableOption = false;
  resizeThrottleTimeoutMs = 500;
  maxHeightPercentage = 0.65;

  componentWillUnmount() {
    if (this.popup) {
      this.popup.remove();
    }
  }

  componentDidMount = () => {
    this.initializeMap();

    $(window).resize(() => {
      // Throttle calling of resizeMap
      clearTimeout(this.resizeThrottleTimerId);
      this.resizeThrottleTimerId = setTimeout(
        this.resizeMap,
        this.resizeThrottleTimeoutMs
      );
    });
  };

  displayPopup(content, loc) {
    if (this.popup) {
      this.popup.remove();
    }
    this.popup = new mapboxgl.Popup()
      .setLngLat(loc)
      .setDOMContent(content)
      .addTo(this.map);
  }

  formatCoordinatesString(latitude, longitude) {
    return longitude + ',' + latitude;
  }

  onPointClick(_this, e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var properties = e.features[0].properties;

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    var content = _this.generateInfoWindowElement(
      properties.school_id,
      properties.school_name,
      properties.school_city,
      properties.school_state,
      _this.formatCoordinatesString(coordinates[0], coordinates[1]),
      properties.teaches_cs ? properties.teaches_cs : ''
    );

    _this.displayPopup(content, coordinates);
  }

  initializeMap = () => {
    this.map = new mapboxgl.Map({
      container: 'mapbox',
      style: 'mapbox://styles/codeorg/cjyudafoo004w1cnpaeq8a0lz',
      zoom: 3,
      minZoom: 1,
      center: [-98, 39]
    });
    var _this = this;

    this.map.on('load', function() {
      _this.map.addSource('censustiles', {
        type: 'vector',
        url: 'mapbox://codeorg.censustiles'
      });

      _this.map.addLayer({
        id: 'census-schools',
        type: 'circle',
        source: 'censustiles',
        'source-layer': 'census',
        layout: {
          visibility: 'visible'
        },
        paint: {
          'circle-radius': 4,
          'circle-color': [
            'match',
            ['get', 'teaches_cs'],
            ['NO', 'HISTORICAL_NO'],
            '#989CF8',
            ['MAYBE', 'HISTORICAL_MAYBE'],
            '#FFFDA6',
            'white'
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#000000'
        },
        filter: [
          'any',
          ['!=', 'teaches_cs', 'YES'],
          ['!=', 'teaches_cs', 'HISTORICAL_YES']
        ]
      });
      _this.map.addLayer({
        id: 'census-schools-teaching-cs',
        type: 'symbol',
        source: 'censustiles',
        'source-layer': 'census',
        layout: {
          'icon-image': 'marker-15-green',
          'icon-allow-overlap': true,
          // Increase the icon size as we zoom in
          'icon-size': ['interpolate', ['linear'], ['zoom'], 1, 0.7, 14, 1.6]
        },
        filter: [
          'any',
          ['==', 'teaches_cs', 'YES'],
          ['==', 'teaches_cs', 'HISTORICAL_YES']
        ]
      });

      _this.map.addControl(
        new mapboxgl.NavigationControl({showCompass: false}),
        'bottom-right'
      );

      _this.map.on('click', 'census-schools', function(e) {
        _this.onPointClick(_this, e);
      });

      _this.map.on('mouseenter', 'census-schools', function() {
        _this.map.getCanvas().style.cursor = 'pointer';
      });

      _this.map.on('mouseleave', 'census-schools', function() {
        _this.map.getCanvas().style.cursor = '';
      });

      _this.map.on('click', 'census-schools-teaching-cs', function(e) {
        _this.onPointClick(_this, e);
      });

      _this.map.on('mouseenter', 'census-schools-teaching-cs', function() {
        _this.map.getCanvas().style.cursor = 'pointer';
      });

      _this.map.on('mouseleave', 'census-schools-teaching-cs', function() {
        _this.map.getCanvas().style.cursor = '';
      });
    });
  };

  updateCensusMapSchool = school => {
    if (school && school.latitude && school.longitude) {
      const schoolLocation = new mapboxgl.LngLat(
        school.longitude,
        school.latitude
      );
      const map_options = {
        center: schoolLocation,
        zoom: 14,
        scrollwheel: this.scrollwheelOption,
        draggable: this.draggableOption,
        speed: 2
      };
      if (this.popup) {
        this.popup.remove();
      }
      this.map.flyTo(map_options);
      const _this = this;
      var flying = true;
      _this.map.on('moveend', function() {
        if (!flying) {
          return;
        }
        flying = false;
        const features = _this.map.querySourceFeatures('censustiles', {
          sourceLayer: 'census',
          filter: ['all', ['==', 'school_id', school.nces_id]]
        });
        if (features.length > 0) {
          const properties = features[0].properties;
          const content = _this.generateInfoWindowElement(
            properties.school_id,
            properties.school_name,
            properties.school_city,
            properties.school_state,
            _this.formatCoordinatesString(school.latitude, school.longitude),
            properties.teaches_cs
          );

          var coordinates = features[0].geometry.coordinates;
          _this.displayPopup(content, coordinates);
        }
      });
    }
  };

  generateInfoWindowElement = (
    schoolId,
    schoolName,
    city,
    state,
    location,
    teachesCs
  ) => {
    const infoWindowDom = document.createElement('div');
    ReactDOM.render(
      <CensusMapInfoWindow
        onTakeSurveyClick={this.props.onTakeSurveyClick}
        schoolId={schoolId}
        schoolName={schoolName}
        city={city}
        state={state}
        location={location}
        teachesCs={teachesCs}
      />,
      infoWindowDom
    );
    return infoWindowDom;
  };

  componentWillReceiveProps(newProps) {
    if (newProps.school !== this.props.school) {
      this.updateCensusMapSchool(newProps.school);
    }
  }

  render() {
    return (
      <div>
        <div id="mapbox" className="full-width">
          <div id="inmaplegend" className="legend">
            <div className="legend-title">Legend</div>
            <div className="color green" />
            <div className="caption">Offers computer science</div>
            <div className="color blue" />
            <div className="caption">Limited or no CS opportunities</div>
            <div className="color yellow" />
            <div className="caption">Inconclusive data</div>
            <div className="color white" />
            <div className="caption">No Data</div>
          </div>
        </div>
        <div id="belowmaplegend" className="legend">
          <div className="legend-title">Legend</div>
          <div className="color green" />
          <div className="caption">Offers computer science</div>
          <div className="color blue" />
          <div className="caption">Limited or no CS opportunities</div>
          <div className="color yellow" />
          <div className="caption">Inconclusive data</div>
          <div className="color white" />
          <div className="caption">No Data</div>
        </div>
        <div id="map-footer">
          <div id="left">
            <a href="/yourschool/about" target="_blank">
              Summary of the data sources we use
            </a>
          </div>
          <div id="right">
            <span id="footer-text">In partnership with</span>
            <img src="/images/fit-100/avatars/computer_science_teachers_association.png" />
          </div>
        </div>
        <br />
        <br />
      </div>
    );
  }
}
