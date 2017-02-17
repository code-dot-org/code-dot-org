/** Section for CS Fundamentals */

import React from 'react';
import {Button} from 'react-bootstrap';
import {TwoPartBanner} from './twoPartBanner';

const CsFundamentalsSection = React.createClass({
  propTypes: {
    lastWorkshopSurveyUrl: React.PropTypes.string
  },

  renderCompletedCourseBox() {
    if (this.props.lastWorkshopSurveyUrl) {
      return (
        <div id="csfStartSurvey">
          <h3>
            Order supplies
          </h3>
          <p>
            Thank you for taking a CS Fundamentals workshop! Please complete this survey about your experience and you
            will be able to order supplies for your classroom. You can print a certificate for completing our workshop.
          </p>
          <Button bsStyle="primary">
            Start survey
          </Button>
          <Button>
            Print certificate
          </Button>
        </div>
      );
    } else {
      return (
        <div id="csfPrintCertificate">
          <h3>
            Thank you
          </h3>
          <p>
            Thank you for taking a CS Fundamentals workshop! You can print a certificate for completing our workshop.
          </p>
          <Button>
            Print certificate
          </Button>
        </div>
      );
    }
  },

  renderOnlineProfessionalLearningBox() {
    return (
      <div>
        <h3>
          Online Professional Learning
        </h3>
        <p>
          Supplement your in-person session with this online K-5 Professional Learning course.
        </p>
        <Button bsStyle="primary">
          Learn online
        </Button>
      </div>
    );
  },

  render() {
    return (
      <div>
        <br/>
        <TwoPartBanner
          textElement={this.renderCompletedCourseBox()}
          imageUrl="url('https://code.org/images/email/BJC4NYC.jpg')"
          imagePosition="imageLeft"
        />

        <br/>

        <TwoPartBanner
          textElement={this.renderOnlineProfessionalLearningBox()}
          imageUrl="url('https://code.org/images/email/BJC4NYC.jpg')"
          imagePosition="imageRight"
        />
      </div>
    );
  }
});

export default CsFundamentalsSection;
