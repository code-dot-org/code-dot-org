/* global google */
import $ from 'jquery';
import React, { PropTypes, Component } from 'react';
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

    switch (this.props.teachesCs) {
      case 'YES':
        censusMessage = "We believe this school offers Computer Science.";
        break;
      case 'NO':
        censusMessage = "We believe this school offers limited or no Computer Science opportunities.";
        break;
      case 'HISTORICAL_YES':
        censusMessage = "We believe this school historically offered Computer Science.";
        break;
      case 'HISTORICAL_NO':
        censusMessage = "We believe this school historically offered limited or no Computer Science opportunities.";
        break;
      case 'MAYBE':
      case 'HISTORICAL_MAYBE':
        censusMessage = "We have conflicting data for this school.";
        break;
      default:
        censusMessage = "We need data for this school.";
        missingCensusData = true;
    }

    const schoolDropdownOption = {
      value: this.props.schoolId,
      label: `${this.props.schoolName} - ${this.props.city}, ${this.props.state}`,
      school: {
        nces_id: this.props.schoolId,
        name: this.props.schoolName,
        city: this.props.city,
        state: this.props.state,
        latitude: this.props.location.split(',')[0],
        longitude: this.props.location.split(',')[1],
      },
    };

    return (
      <div id="census-info-window" className="census-info-window">
        <h4>
          <b>
            {this.props.schoolName}
          </b>
          <br />
          ({this.props.city}, {this.props.state})
        </h4>
        <hr />
        <div className="census-message">
          {censusMessage}
          {!missingCensusData && (
            <span>
              &nbsp;
              <a
                href="/yourschool/about"
                target="_blank"
              >
                (Why?)
              </a>
            </span>
          )}
        </div>
        <div className="button-container">
          <div className="button-link-div">
            <a onClick={() => this.props.onTakeSurveyClick(schoolDropdownOption, false)}>
              <div className="button">
                <div className="button-text">Take the survey for this school</div>
              </div>
            </a>
          </div>
          <div className="button-link-div">
            <a href="/yourschool/letter" target="_blank">
              <div className="button">
                <div className="button-text">Send the survey to a teacher at this school</div>
              </div>
            </a>
          </div>
        </div>
        {!missingCensusData && (
          <div className="inaccuracy-link">
            <a onClick={() => this.props.onTakeSurveyClick(schoolDropdownOption, true)}>
              I believe that the categorization for this school is inaccurate.
            </a>
          </div>
        )}
      </div>
    );
  }
}

export default class CensusMap extends Component {
  static propTypes = {
    onTakeSurveyClick: PropTypes.func.isRequired,
    fusionTableId: PropTypes.string.isRequired,
    school: PropTypes.object,
  };

  gmap = undefined;
  scrollwheelOption = false;
  draggableOption = false;
  resizeThrottleTimerId = undefined;
  resizeThrottleTimeoutMs = 500;
  maxHeightPercentage = 0.65;
  infoWindow = undefined;

  componentWillMount() {
    this.infoWindow = new google.maps.InfoWindow();
  }

  componentWillUnmount() {
    this.InfoWindow.close();
  }

  componentDidMount = () => {
    this.initializeMap();
    this.resizeMap();

    $(window).resize(() => {
      // Throttle calling of resizeMap
      clearTimeout(this.resizeThrottleTimerId);
      this.resizeThrottleTimerId = setTimeout(this.resizeMap, this.resizeThrottleTimeoutMs);
    });
  };

  initializeMap = () => {
    var mapOptions = {
      center: new google.maps.LatLng(37.6642776,-97.7238747),
      zoom: 4,
      minZoom: 1,
      scrollwheel: this.scrollwheelOption,
      draggable: this.draggableOption,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.gmap = new google.maps.Map(document.getElementById("gmap"), mapOptions);

    var layer = new google.maps.FusionTablesLayer({
      suppressInfoWindows: true,
      query: {
        select: 'location',
        from: this.props.fusionTableId,
        where: "location NOT IN ''",
      },
      styles: [
        {
          where: "teaches_cs IN ''",
          markerOptions: {
            iconName: "measle_white"
          }
        },
        {
          where: "teaches_cs IN ('YES', 'HISTORICAL_YES')",
          markerOptions: {
            iconName: "grn_blank"
          }
        },
        {
          where: "teaches_cs IN ('NO', 'HISTORICAL_NO')",
          markerOptions: {
            iconName: "small_blue"
          }
        },

        {
          where: "teaches_cs IN ('MAYBE', 'HISTORICAL_MAYBE')",
          markerOptions: {
            iconName: "small_yellow"
          }
        },
      ],
    });

    var legend = document.createElement('div');
    legend.id = 'inmaplegend';
    legend.className = 'legend';
    legend.index = 1;
    $("#belowmaplegend div").clone().appendTo(legend);

    this.gmap.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

    layer.setMap(this.gmap);

    google.maps.event.addListener(layer, 'click', (event) => {
      this.enableDrag();
      const latitude = event.row['location'].value.split(',')[0];
      const longitude = event.row['location'].value.split(',')[1];
      const location = new google.maps.LatLng(latitude, longitude);
      this.infoWindow.close();
      this.infoWindow.setContent(this.generateInfoWindowElement(
        event.row['school_id'].value,
        event.row['school_name'].value,
        event.row['city'].value,
        event.row['state_code'].value,
        event.row['location'].value,
        event.row['teaches_cs'].value
      ));
      this.infoWindow.setPosition(location);
      this.infoWindow.open(this.gmap);
    });
    google.maps.event.addListener(this.gmap, 'zoom_changed', (event) => {
      this.enableDrag();
    });
    google.maps.event.addListener(this.gmap, 'click', (event) => {
      this.enableDrag();
    });
  };

  generateInfoWindowElement = (schoolId, schoolName, city, state, location, teachesCs) => {
    const infoWindowDom = document.createElement("div");
    ReactDOM.render(
      <CensusMapInfoWindow
        onTakeSurveyClick={this.props.onTakeSurveyClick}
        schoolId={schoolId}
        schoolName={schoolName}
        city={city}
        state={state}
        location={location}
        teachesCs={teachesCs}
      />, infoWindowDom);
    return infoWindowDom;
  };

  updateCensusMapSchool = (school) => {
    if (school && school.latitude && school.longitude) {
      const schoolLocation = new google.maps.LatLng(school.latitude, school.longitude);
      const map_options = {
        center: schoolLocation,
        zoom: 14,
        scrollwheel: this.scrollwheelOption,
        draggable: this.draggableOption,
      };
      this.gmap.setOptions(map_options);
      const tableId = this.props.fusionTableId;
      const query = encodeURIComponent(`SELECT * FROM ${tableId} WHERE school_id in '${school.nces_id}'`);
      const gvizQuery = new google.visualization.Query(`https://www.google.com/fusiontables/gvizdata?tq=${query}`);

      gvizQuery.send((response) => {
        const datatable = response.getDataTable();
        if (datatable && datatable.getNumberOfRows()) {
          const schoolId = datatable.getValue(0,0);
          const schoolName = datatable.getValue(0,2);
          const city = datatable.getValue(0,3);
          const state = datatable.getValue(0,4);
          const location = datatable.getValue(0,5);
          const teachesCs = datatable.getValue(0,6);

          this.infoWindow.close();
          this.infoWindow.setContent(this.generateInfoWindowElement(
            schoolId,
            schoolName,
            city,
            state,
            location,
            teachesCs
          ));
          this.infoWindow.setPosition(schoolLocation);
          this.infoWindow.open(this.gmap);
        }
      });
    }
  };

  enableDrag = () => {
    this.scrollwheelOption = true;
    this.draggableOption = true;

    var map_options = {
      scrollwheel: this.scrollwheelOption,
      draggable: this.draggableOption
    };
    this.gmap.setOptions(map_options);
  };

  resizeMap = () => {
    var map_width = $('#gmap').width();
    var map_zoom = this.gmap.getZoom();

    // Max height of map is 2/3 of screen height so user can always scroll.
    var max_height = $(window).innerHeight() * this.maxHeightPercentage;

    // Min height is so that the popup info window is tall enough.
    var min_height = 450;

    var window_aspect_ratio = $(window).innerHeight() / $(window).innerWidth();

    let map_height;
    if  (window_aspect_ratio < 1) {
      // Landscape window. Use the current 1:2 ratio map size.
      map_height = map_width / 2;

      // Make sure this size doesn't exceed our max height.
      map_height = Math.min(map_height, max_height);

      // Let's finally apply the min height.
      map_height = Math.max(map_height, min_height);
    } else {
      // Portrait window. Just use the max height so that it's taller and more usable.
      map_height = max_height;
    }

    $('#gmap').height(Math.round(map_height));

    if (map_width < 256 && map_zoom < 3) {
      map_zoom = 0;
    } else if (map_width < 512 && map_zoom < 3) {
      map_zoom = 1;
    } else if (map_zoom < 3) {
      map_zoom = 2;
    }

    var map_options = {
      zoom: map_zoom,
      scrollwheel: this.scrollwheelOption,
      draggable: this.draggableOption
    };

    this.gmap.setOptions(map_options);
  };

  componentWillReceiveProps(newProps) {
    if (newProps.school !== this.props.school) {
      this.updateCensusMapSchool(newProps.school);
    }
  }

  render() {
    return (
      <div>
        <div id="gmap" className="full-width" />
        <div id="belowmaplegend" className="legend">
          <div className="legend-title">
            Legend
          </div>
          <div className="color green" />
          <div className="caption">
            Offers computer science
          </div>
          <div className="color blue" />
          <div className="caption">
            Limited or no CS opportunities
          </div>
          <div className="color yellow" />
          <div className="caption">
            Inconclusive data
          </div>
          <div className="color white" />
          <div className="caption">
            No Data
          </div>
        </div>
        <div id="map-footer">
          <div id="left">
            <a
              href="/yourschool/about"
              target="_blank"
            >
              Summary of the data sources we use
            </a>
          </div>
          <div id="right">
            <span id="footer-text">
              In partnership with
            </span>
            <img src="/images/fit-200/avatars/computer_science_teachers_association.png"/>
          </div>
        </div>
        <br />
        <br />
      </div>
    );
  }
}
