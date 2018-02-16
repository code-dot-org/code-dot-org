import $ from 'jquery';
import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import {UnconnectedCensusForm as CensusForm, censusFormPrefillDataShape} from './CensusForm';
import YourSchoolResources from './YourSchoolResources';
import Notification, { NotificationType } from '../Notification';
import MobileNotification from '../MobileNotification';
import {SpecialAnnouncementActionBlock} from '../studioHomepages/TwoColumnActionBlock';
import i18n from "@cdo/locale";
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import { ResponsiveSize } from '@cdo/apps/code-studio/responsiveRedux';
import SchoolAutocompleteDropdown from '../SchoolAutocompleteDropdown';

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
    hideMap: PropTypes.bool,
    updateCensusMapSchool: PropTypes.func.isRequired,
  };

  componentDidMount() {
    if (!this.props.hideMap) {
      $('#map').appendTo(ReactDOM.findDOMNode(this.refs.map)).show();
    }
  }

  state = {
    schoolDropdownOption: undefined
  };

  handleSchoolDropdownChange = (option) => {
    this.setState({
      schoolDropdownOption: option,
    });

    const schoolId = option ? option.value.toString() : '';
    if (option && schoolId !== '-1') {
      this.props.updateCensusMapSchool(option.school);
    }
  };

  render() {
    const {responsiveSize} = this.props;
    const desktop = (responsiveSize === ResponsiveSize.lg) || (responsiveSize === ResponsiveSize.md);

    return (
      <div>
        <SpecialAnnouncementActionBlock/>
        {this.props.alertHeading && this.props.alertText && this.props.alertUrl && desktop && (
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
        {this.props.alertHeading && this.props.alertText && this.props.alertUrl && !desktop && (
          <MobileNotification
            notice={this.props.alertHeading}
            details={this.props.alertText}
            buttonText={i18n.learnMore()}
            buttonLink={this.props.alertUrl}
            newWindow={true}
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
               schoolDropdownOption={this.state.schoolDropdownOption}
               onChange={this.handleSchoolDropdownChange}
             />
             <br/>
             <ProtectedStatefulDiv ref="map"/>
           </div>
        )}
        <CensusForm
          prefillData={this.props.prefillData}
          schoolDropdownOption={this.state.schoolDropdownOption}
          onSchoolDropdownChange={this.handleSchoolDropdownChange}
        />
      </div>
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
}))(YourSchool);
