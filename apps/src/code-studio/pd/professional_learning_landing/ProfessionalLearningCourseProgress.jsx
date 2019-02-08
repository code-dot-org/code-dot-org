/**
 *  Progress for professional learning courses as rendered on the landing page
 */

import PropTypes from 'prop-types';

import React, {Component} from 'react';
import PlcEnrollment from './plcElements/PlcEnrollment';

export default class ProfessionalLearningCourseProgress extends Component {
  static propTypes = {
    professionalLearningCourseData: PropTypes.array
  };

  render() {
    if (
      this.props.professionalLearningCourseData &&
      this.props.professionalLearningCourseData.length > 0
    ) {
      return (
        <div>
          <h2>Online Professional Learning Courses</h2>
          <div>
            {this.props.professionalLearningCourseData.map((plcData, i) => (
              <PlcEnrollment key={i} plcData={plcData} />
            ))}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}
