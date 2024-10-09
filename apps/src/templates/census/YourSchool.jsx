import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import fontConstants from '@cdo/apps/fontConstants';
import i18n from '@cdo/locale';

import Notification, {
  NotificationType,
} from '../../sharedComponents/Notification';
import SchoolAutocompleteDropdown from '../SchoolAutocompleteDropdown';
import MarketingAnnouncementBanner from '../studioHomepages/MarketingAnnouncementBanner';

import {
  UnconnectedCensusForm as CensusForm,
  censusFormPrefillDataShape,
} from './CensusForm';
import CensusMap from './CensusMap';
import YourSchoolResources from './YourSchoolResources';

const accessReportBannerParams = {
  id: 'announcement-id',
  image: '/images/marketing/accessreport_teacherdash.png',
  title: i18n.accessReportBannerTitle(),
  body: i18n.accessReportBannerDesc(),
  buttonUrl: 'https://advocacy.code.org/stateofcs/',
  buttonText: i18n.accessReportBannerButton(),
  buttonId: 'access-report-launch-2024',
};

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
    showReportLaunchBanner: PropTypes.bool,
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

    return (
      <div>
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
        {this.props.showReportLaunchBanner && (
          <MarketingAnnouncementBanner
            announcement={accessReportBannerParams}
            marginBottom="30px"
          />
        )}
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
            <CensusMap
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
    ...fontConstants['main-font-regular'],
    lineHeight: '1.5em',
  },
  mapFooter: {
    ...fontConstants['main-font-bold'],
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
