import PropTypes from 'prop-types';

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  UnconnectedCensusForm as CensusForm,
  censusFormPrefillDataShape,
} from './CensusForm';
import YourSchoolResources from './YourSchoolResources';
import Notification, {NotificationType} from '../Notification';
import {SpecialAnnouncementActionBlock} from '../studioHomepages/TwoColumnActionBlock';
import i18n from '@cdo/locale';
import SchoolAutocompleteDropdown from '../SchoolAutocompleteDropdown';
import CensusMapReplacement from './CensusMapReplacement';

class YourSchool extends Component {
  static propTypes = {
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    alertHeading: PropTypes.string,
    alertText: PropTypes.string,
    alertUrl: PropTypes.string,
    prefillData: censusFormPrefillDataShape,
    hideMap: PropTypes.bool,
    currentCensusYear: PropTypes.number,
    teacherApplicationMode: PropTypes.string,
    tileset: PropTypes.string.isRequired,
  };

  state = {
    schoolDropdownOption: undefined,
  };

  handleTakeSurveyClick = schoolDropdownOption => {
    this.setState({
      schoolDropdownOption: schoolDropdownOption,
    });
    adjustScroll('form');
  };

  handleMapSchoolDropdownChange = option => {
    this.handleSchoolDropdownChange(option);
    if (option && option.value === '-1') {
      adjustScroll('form');
    }
  };

  handleSchoolDropdownChange = option => {
    this.setState({
      schoolDropdownOption: option,
    });
  };

  hasLocation = school => {
    return !!(school.latitude && school.longitude);
  };

  render() {
    const schoolDropdownOption = this.state.schoolDropdownOption;
    const schoolId = schoolDropdownOption
      ? schoolDropdownOption.value.toString()
      : '';
    let schoolForMap;
    if (schoolDropdownOption && schoolId !== '-1') {
      schoolForMap = schoolDropdownOption.school;
    }

    // Hide the special announcement.
    const showSpecialAnnouncement = false;

    return (
      <div>
        {showSpecialAnnouncement && <SpecialAnnouncementActionBlock />}
        {this.props.alertHeading &&
          this.props.alertText &&
          this.props.alertUrl && (
            <Notification
              type={NotificationType.bullhorn}
              notice={this.props.alertHeading}
              details={this.props.alertText}
              buttonText={i18n.learnMore()}
              buttonLink={this.props.alertUrl}
              dismissible={false}
              newWindow={true}
              width="100%"
            />
          )}
        <h1 style={styles.heading}>{i18n.yourSchoolHeading()}</h1>
        <h3 style={styles.description}>{i18n.yourSchoolDescription()}</h3>
        <YourSchoolResources />
        {!this.props.hideMap && (
          <div id="map">
            <h1 style={styles.heading}>
              Does your school teach Computer Science?
            </h1>
            <h3 style={styles.description}>
              Find your school on the map to see if computer science was offered
              during the {this.props.currentCensusYear - 1}-
              {this.props.currentCensusYear} school year. Then{' '}
              <a href="#form">fill out the survey below</a> to make sure your
              school is accurately represented for{' '}
              {this.props.currentCensusYear}-{this.props.currentCensusYear + 1}.
            </h3>
            <SchoolAutocompleteDropdown
              value={
                this.props.prefillData
                  ? this.props.prefillData['schoolId']
                  : undefined
              }
              fieldName="census-map-school-dropdown"
              schoolDropdownOption={schoolDropdownOption}
              onChange={this.handleMapSchoolDropdownChange}
              schoolFilter={this.hasLocation}
            />
            <br />
            <CensusMapReplacement
              school={schoolForMap}
              onTakeSurveyClick={this.handleTakeSurveyClick}
              tileset={this.props.tileset}
            />
          </div>
        )}
        <CensusForm
          prefillData={this.props.prefillData}
          schoolDropdownOption={schoolDropdownOption}
          onSchoolDropdownChange={this.handleSchoolDropdownChange}
          initialSchoolYear={this.props.currentCensusYear}
        />
      </div>
    );
  }
}

const styles = {
  heading: {
    marginTop: 20,
    marginBottom: 0,
  },
  description: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    lineHeight: '1.5em',
  },
  mapFooter: {
    fontFamily: '"Gotham 7r", sans-serif',
    fontSize: 20,
    marginLeft: 25,
    marginRight: 25,
  },

  banner: {
    marginBottom: 35,
  },
};

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
}))(YourSchool);
