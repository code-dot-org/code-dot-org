/**
 * Teacher Landing Page
 */

import React, {PropTypes} from 'react';
import {Button} from 'react-bootstrap';
import ProfessionalLearningCourseProgress from './professionalLearningCourseProgress';
import {TwoPartBanner} from './twoPartBanner';
import {UnconnectedTwoColumnActionBlock as TwoColumnActionBlock} from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import {EnrolledWorkshops} from './enrolledWorkshops';
import _ from 'lodash';
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
}

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
          My Professional Learning
        </div>
      </div>
    );
  },

  renderWorkshopSurveyInterior() {
    if (this.props.lastWorkshopSurveyCourse === 'CS Fundamentals') {
      return (
        <div>
          <h3>
            Submit feedback and order free course kit
          </h3>
          <p>
            Thank you for taking a CS Fundamentals workshop! Please complete this survey about your experience and you
            will be able to order supplies for your classroom.
          </p>
          <Button bsStyle="primary" onClick={() => {window.open(this.props.lastWorkshopSurveyUrl, '_blank');}}>
            Start survey
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          <h3>
            Submit your feedback!
          </h3>
          <p>
            Thank you for completing a {this.props.lastWorkshopSurveyCourse} workshop!
            Please complete this survey about your experience to help us improve future
            workshops.
          </p>
          <Button bsStyle="primary" onClick={() => {window.open(this.props.lastWorkshopSurveyUrl, '_blank');}}>
            Start survey
          </Button>
        </div>
      );
    }
  },

  render() {
    const CSF = this.props.lastWorkshopSurveyCourse === 'CS Fundamentals';
    const subheading = CSF ? Submit feedback and order free course kit : Submit your feedback;
    const description = CSF ? Thank you for taking a CS Fundamentals workshop! Please complete this survey about your experience and you
    will be able to order supplies for your classroom. :
    Thank you for completing a {this.props.lastWorkshopSurveyCourse} workshop!
    Please complete this survey about your experience to help us improve future
    workshops.;

    const lastWorkshopSurveyBanner = (
      <div>
        <TwoColumnActionBlock
          isRtl={false}
          responsiveSize='lg'
          imageUrl={pegasus('shared/images/misc/teacher-training.png')}
          subHeading={subheading}
          description={description}
          buttons={[
            {
              url: pegasus('/learn/local'),
              text: "Start survey"
            }
          ]}
        />
        <TwoPartBanner
          textElement={this.renderWorkshopSurveyInterior()}
          imageUrl="url('https://code.org/images/email/BJC4NYC.jpg')"
          imagePosition="imageLeft"
        />
      </div>
    );

    const upcomingWorkshops = (
      <EnrolledWorkshops
        key="upcomingWorkshops"
      />
    );

    const plcData = !_.isEmpty(this.props.professionalLearningCourseData) && (
      <ProfessionalLearningCourseProgress
        professionalLearningCourseData={this.props.professionalLearningCourseData}
        key="plcData"
      />
    );

    return (
      <div>
        {this.renderHeaderImage()}
        <br/>
        {lastWorkshopSurveyBanner}
        {upcomingWorkshops}
        {plcData}
      </div>
    );
  }
});

export default LandingPage;
