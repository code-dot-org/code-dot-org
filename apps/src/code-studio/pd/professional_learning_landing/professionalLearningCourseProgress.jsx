/**
 *  Progress for professional learning courses as rendered on the landing page
 */

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import PlcEnrollment from './plcElements/plcEnrollment';


const ProfessionalLearningCourseProgress = createReactClass({
  propTypes: {
    professionalLearningCourseData: PropTypes.array
  },

  renderProfessionalLearningEnrollments() {
    return (
      <div>
        {
          this.props.professionalLearningCourseData.map((plcData, i) => {
            return (
              <PlcEnrollment
                key={i}
                plcData={plcData}
              />
            );
          })
        }
      </div>
    );
  },

  render() {
    if (this.props.professionalLearningCourseData && this.props.professionalLearningCourseData.length > 0) {
      return (
        <div>
          <h2>
            Online Professional Learning Courses
          </h2>
          {this.renderProfessionalLearningEnrollments()}
        </div>
      );
    } else {
      return null;
    }
  }
});
ProfessionalLearningCourseProgress.displayName = 'ProfessionalLearningCourseProgress';
export default ProfessionalLearningCourseProgress;
