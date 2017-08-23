import React, {Component, PropTypes} from 'react';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import Responsive from '../../responsive';
import i18n from "@cdo/locale";

class CourseBlocksTeacherGradeBands extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  };

  cards = [
    {
      heading: i18n.courseBlocksGradeBandsK5(),
      description: i18n.courseBlocksGradeBandsK5Description(),
      path: '/student/elementary'
    },
    {
      heading: i18n.courseBlocksGradeBands612(),
      description: i18n.courseBlocksGradeBands612Description(),
      path: '/student/middle-high'
    },
    {
      heading: i18n.courseBlocksGradeBandsUniversity(),
      description: i18n.courseBlocksGradeBandsUniversityDescription(),
      path: '/student/university'
    }
  ];

  render() {
    return (
      <CourseBlocksGradeBands
        cards={this.cards}
        isRtl={this.props.isRtl}
        responsive={this.props.responsive}
      />
    );
  }
}

export default CourseBlocksTeacherGradeBands;
