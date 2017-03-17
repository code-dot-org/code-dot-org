/**
 * Teacher Landing Page
 */

import React from 'react';
import CsFundamentalsSection from './csFundamentalsSection';
import CsPrinciplesAndDiscoveriesSection from './csPrinciplesAndDiscoveriesSection';
import ProfessionalLearningCourseProgress from './professionalLearningCourseProgress';
import {UpcomingWorkshops} from './upcomingWorkshops';
import _ from 'lodash';

const CSPCSDcourses = ['CS Principles', 'CS Discoveries'];

const LandingPage = React.createClass({
  propTypes: {
    coursesCompleted: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    coursesTaught: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    lastWorkshopSurveyUrl: React.PropTypes.string,
    lastWorkshopSurveyCourse: React.PropTypes.string,
    printCsfCertificateUrl: React.PropTypes.string,
    professionalLearningCourseData: React.PropTypes.array
  },

  renderHeaderImage() {
    return (
      <div
        style={{
          width: '100%',
          height: '300px',
          background: `url(https://code.org/images/homepage/sheryl.jpg) no-repeat`,
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

  shouldRenderCSFSection() {
    return this.props.coursesTaught.includes('CS Fundamentals');
  },

  shouldRenderCSPCSDSection() {
    return !!(_.intersection(CSPCSDcourses, this.props.coursesCompleted).length ||
      (_.intersection(CSPCSDcourses, this.props.coursesTaught).length && this.props.lastWorkshopSurveyUrl));
  },

  render() {
    const csFundamentalsSection = this.shouldRenderCSFSection() && (
      <CsFundamentalsSection
        key="csFundamentalsSection"
        csfCompleted={this.props.coursesCompleted.includes('CS Fundamentals')}
        lastWorkshopSurveyUrl={this.props.lastWorkshopSurveyCourse === 'CS Fundamentals' ? this.props.lastWorkshopSurveyUrl : null}
        printCsfCertificateUrl={this.props.printCsfCertificateUrl}
      />
    );

    const csPrinciplesAndDiscoveriesSection = this.shouldRenderCSPCSDSection() && (
      <CsPrinciplesAndDiscoveriesSection
        key="csPrinciplesAndDiscoveriesSection"
        lastWorkshopSurveyUrl={['CS Principles', 'CS Discoveries'].includes(this.props.lastWorkshopSurveyCourse) ? this.props.lastWorkshopSurveyUrl : null}
        coursesCompleted={this.props.coursesCompleted}
      />
    );

    const upcomingWorkshops = (
      <UpcomingWorkshops
        key="upcomingWorkshops"
      />
    );

    const plcData = !_.isEmpty(this.props.professionalLearningCourseData) && (
      <ProfessionalLearningCourseProgress
        professionalLearningCourseData={this.props.professionalLearningCourseData}
        key="plcData"
      />
    );

    let order = [];

    if (this.props.lastWorkshopSurveyUrl) {
      order = _.compact([csFundamentalsSection, csPrinciplesAndDiscoveriesSection, upcomingWorkshops, plcData]);
    } else {
      order = _.compact([upcomingWorkshops, csFundamentalsSection, csPrinciplesAndDiscoveriesSection, plcData]);
    }

    return (
      <div>
        {this.renderHeaderImage()}
        {order}
      </div>
    );
  }
});

export default LandingPage;
