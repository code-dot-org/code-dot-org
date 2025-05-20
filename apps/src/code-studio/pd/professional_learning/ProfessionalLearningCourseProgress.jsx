/**
 *  Progress for professional learning courses as rendered on the landing page
 */

import PropTypes from 'prop-types';
import React, {Component} from 'react';

import PlcEnrollment from './plcElements/PlcEnrollment';

export default class ProfessionalLearningCourseProgress extends Component {
  static propTypes = {
    deeperLearningCourseData: PropTypes.array,
  };

  render() {
    if (
      this.props.deeperLearningCourseData &&
      this.props.deeperLearningCourseData.length > 0
    ) {
      return (
        <div>
          {this.props.deeperLearningCourseData.map((plcData, i) => (
            <PlcEnrollment key={i} plcData={plcData} />
          ))}
        </div>
      );
    } else {
      return null;
    }
  }
}
