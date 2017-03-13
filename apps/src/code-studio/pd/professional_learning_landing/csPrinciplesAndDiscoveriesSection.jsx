/** Section for CS Principles and CS Discoveries */

import React from 'react';
import {TwoPartBanner} from './twoPartBanner';
import {Button} from 'react-bootstrap';

const CsPrinciplesAndDiscoveriesSection = React.createClass({
  propTypes: {
    coursesCompleted: React.PropTypes.arrayOf(React.PropTypes.string),
    lastWorkshopSurveyUrl: React.PropTypes.string
  },

  renderCompletedCourseBox() {
    if (this.props.lastWorkshopSurveyUrl) {
      return (
        <div id="cspStartSurvey">
          <h3>
            Share your feedback
          </h3>
          <p>
            Thank you for completing a Code.org professional learning workshop! Please complete this survey so that we
            may improve your experience.
          </p>
          <Button bsStyle="primary" onClick={() => {window.location = this.props.lastWorkshopSurveyUrl;}}>
            Start Survey
          </Button>
        </div>
      );
    } else if (this.props.coursesCompleted && this.props.coursesCompleted.length > 0) {
      return (
        <div style={{marginTop: '20px'}} id="cspThanks">
          <h3>
            Thank you
          </h3>
          <p>
            Thank you for completing a Code.org professional workshop! If you have any other feedback or comments,
            please email teacher@code.org
          </p>
        </div>
      );
    }
  },

  render() {
    return (
      <div>
        <br/>
        <TwoPartBanner
          imageUrl="url('https://code.org/images/email/BJC4NYC.jpg')"
          textElement={this.renderCompletedCourseBox()}
          imagePosition="imageLeft"
        />
      </div>
    );
  }
});

export default CsPrinciplesAndDiscoveriesSection;
