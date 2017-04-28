/**
 * Teacher Landing Page
 */

import React from 'react';
import {Button} from 'react-bootstrap';
import ProfessionalLearningCourseProgress from './professionalLearningCourseProgress';
import {TwoPartBanner} from './twoPartBanner';
import {EnrolledWorkshops} from './enrolledWorkshops';
import _ from 'lodash';

const LandingPage = React.createClass({
  propTypes: {
    lastWorkshopSurveyUrl: React.PropTypes.string,
    lastWorkshopSurveyCourse: React.PropTypes.string,
    professionalLearningCourseData: React.PropTypes.array
  },

  renderHeaderImage() {
    return (
      <div
        style={{
          width: '100%',
          height: '300px',
          background: `url(/blockly/media/BannerKids.png) no-repeat`,
          backgroundSize: 'cover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, .5)',
            alignSelf: 'flex-end',
            width: '100%',
            textAlign: 'center',
            padding: '30px',
            fontSize: '40px',
            color: 'white'
          }}
        >
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
    const lastWorkshopSurveyBanner = this.props.lastWorkshopSurveyUrl && (
      <TwoPartBanner
        textElement={this.renderWorkshopSurveyInterior()}
        imageUrl="url('https://code.org/images/email/BJC4NYC.jpg')"
        imagePosition="imageLeft"
      />
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
        {this.props.lastWorkshopSurveyUrl && lastWorkshopSurveyBanner}
        {upcomingWorkshops}
        {plcData}
      </div>
    );
  }
});

export default LandingPage;
