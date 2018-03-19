import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import {UnconnectedCensusForm as CensusForm, censusFormPrefillDataShape} from './CensusForm';
import YourSchoolResources from './YourSchoolResources';
import Notification, { NotificationType } from '../Notification';
import {SpecialAnnouncementActionBlock} from '../studioHomepages/TwoColumnActionBlock';
import i18n from "@cdo/locale";
import SchoolAutocompleteDropdown from '../SchoolAutocompleteDropdown';
import CensusMap from './CensusMap';

const styles = {
  heading: {
    marginTop: 20,
    marginBottom: 0
  },
  description: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    lineHeight: '1.5em'
  },
  mapFooter: {
    fontFamily: '"Gotham 7r", sans-serif',
    fontSize: 20,
    marginLeft: 25,
    marginRight: 25
  }
};

class YourSchool extends Component {
  static propTypes = {
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    alertHeading: PropTypes.string,
    alertText: PropTypes.string,
    alertUrl: PropTypes.string,
    prefillData: censusFormPrefillDataShape,
    fusionTableId: PropTypes.string,
    hideMap: PropTypes.bool,
  };

  state = {
    schoolDropdownOption: undefined,
  };

  handleSchoolDropdownChange = (option) => {
    this.setState({
      schoolDropdownOption: option,
    });
  };

  hasLocation = (school) => {
    return !!(school.latitude && school.longitude);
  };

  render() {
    const schoolDropdownOption = this.state.schoolDropdownOption;
    const schoolId = schoolDropdownOption ? schoolDropdownOption.value.toString() : '';
    let schoolForMap;
    if (schoolDropdownOption && schoolId !== '-1') {
      schoolForMap = schoolDropdownOption.school;
    }
    return (
      <div>
        <SpecialAnnouncementActionBlock/>
        {this.props.alertHeading && this.props.alertText && this.props.alertUrl && (
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
        <h1 style={styles.heading}>
          {i18n.yourSchoolHeading()}
        </h1>
        <h3 style={styles.description}>
          {i18n.yourSchoolDescription()}
        </h3>
        <YourSchoolResources/>
        {!this.props.hideMap && (
           <div>
             <h1 style={styles.heading}>
               Does your school teach Computer Science?
             </h1>
             <h3 style={styles.description}>
               Find your school on the map to see if computer science is already being offered.
               Can't find your school on the map? <a href="#form">Fill out the survey below</a>.
             </h3>
             <SchoolAutocompleteDropdown
               value={this.props.prefillData ? this.props.prefillData['schoolId'] : undefined}
               fieldName="census-map-school-dropdown"
               schoolDropdownOption={schoolDropdownOption}
               onChange={this.handleSchoolDropdownChange}
               schoolFilter={this.hasLocation}
             />
             <br/>
             <CensusMap
               fusionTableId={this.props.fusionTableId}
               school={schoolForMap}
               onSchoolChange={this.handleSchoolDropdownChange}
             />
           </div>
        )}
        <CensusForm
          prefillData={this.props.prefillData}
          schoolDropdownOption={schoolDropdownOption}
          onSchoolDropdownChange={this.handleSchoolDropdownChange}
        />
      </div>
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
}))(YourSchool);
