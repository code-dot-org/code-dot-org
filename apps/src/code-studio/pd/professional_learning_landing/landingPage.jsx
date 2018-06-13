/**
 * Teacher Landing Page
 */

import React, {PropTypes} from 'react';
import ProfessionalLearningCourseProgress from './professionalLearningCourseProgress';
import {UnconnectedTwoColumnActionBlock as TwoColumnActionBlock} from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import {EnrolledWorkshops} from './enrolledWorkshops';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import i18n from "@cdo/locale";

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
  },
};

const LandingPage = React.createClass({
  propTypes: {
    lastWorkshopSurveyUrl: PropTypes.string,
    lastWorkshopSurveyCourse: PropTypes.string,
    professionalLearningCourseData: PropTypes.array
  },

  renderHeaderImage() {
    return (
      <div style={styles.headerImage}>
        <div style={styles.headerText}>
          {i18n.plLandingHeading()}
        </div>
      </div>
    );
  },

  render() {
    const CSF = this.props.lastWorkshopSurveyCourse === 'CS Fundamentals';
    const subheading = CSF ?
      i18n.plLandingSubheadingCSF() :
      i18n.plLandingSubheading();
    const description = CSF ?
      i18n.plLandingDescriptionCSF() :
      i18n.plLandingDescription();

    return (
      <div>
        {this.renderHeaderImage()}
        <br/>
        {this.props.lastWorkshopSurveyUrl && (
          <TwoColumnActionBlock
            isRtl={false}
            responsiveSize="lg"
            imageUrl={pegasus('/shared/images/fill-540x289/misc/teacher.png')}
            subHeading={subheading}
            description={description}
            buttons={[
              {
                url: "/",
                text: "Start survey"
              }
            ]}
          />
        )}
        <EnrolledWorkshops
          key="upcomingWorkshops"
        />
        {this.props.professionalLearningCourseData && (
          <ProfessionalLearningCourseProgress
            professionalLearningCourseData={this.props.professionalLearningCourseData}
            key="plcData"
          />
        )}
      </div>
    );
  }
});

export default LandingPage;
