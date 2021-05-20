/**
 * Teacher Landing Page
 */

import PropTypes from 'prop-types';

import React, {Component} from 'react';
import ProfessionalLearningCourseProgress from './ProfessionalLearningCourseProgress';
import {UnconnectedTwoColumnActionBlock as TwoColumnActionBlock} from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import {EnrolledWorkshops} from './EnrolledWorkshops';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

export default class LandingPage extends Component {
  static propTypes = {
    lastWorkshopSurveyUrl: PropTypes.string,
    lastWorkshopSurveyCourse: PropTypes.string,
    professionalLearningCourseData: PropTypes.array
  };

  render() {
    return (
      <div>
        <HeaderImage />
        <br />
        {this.props.lastWorkshopSurveyUrl && (
          <LastWorkshopSurveyBanner
            subHeading={i18n.plLandingSubheading()}
            description={i18n.plLandingDescription({
              course: this.props.lastWorkshopSurveyCourse
            })}
            surveyUrl={this.props.lastWorkshopSurveyUrl}
          />
        )}
        <EnrolledWorkshops />
        {this.props.professionalLearningCourseData && (
          <ProfessionalLearningCourseProgress
            professionalLearningCourseData={
              this.props.professionalLearningCourseData
            }
          />
        )}
      </div>
    );
  }
}

const styles = {
  headerImage: {
    width: '100%',
    height: '300px',
    background: `url(/blockly/media/BannerKids.png) no-repeat`,
    backgroundSize: 'cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: {
    backgroundColor: 'rgba(0, 0, 0, .5)',
    alignSelf: 'flex-end',
    width: '100%',
    textAlign: 'center',
    padding: '30px',
    fontSize: '40px',
    color: 'white'
  }
};

const HeaderImage = () => (
  <div style={styles.headerImage}>
    <div style={styles.headerText}>{i18n.plLandingHeading()}</div>
  </div>
);

export const LastWorkshopSurveyBanner = ({
  subHeading,
  description,
  surveyUrl
}) => (
  <TwoColumnActionBlock
    isRtl={false}
    responsiveSize="lg"
    imageUrl={pegasus('/shared/images/fill-540x300/misc/teacher.png')}
    subHeading={subHeading}
    description={description}
    buttons={[
      {
        url: surveyUrl,
        text: i18n.plLandingStartSurvey(),
        target: '_blank'
      }
    ]}
  />
);
LastWorkshopSurveyBanner.propTypes = {
  subHeading: PropTypes.string,
  description: PropTypes.string,
  surveyUrl: PropTypes.string
};
