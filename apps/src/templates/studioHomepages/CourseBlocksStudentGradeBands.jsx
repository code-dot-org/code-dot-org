import React, {Component, PropTypes} from 'react';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import Responsive from '../../responsive';
import i18n from "@cdo/locale";

class CourseBlocksStudentGradeBands extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  };

  cards = [
    {
      heading: i18n.courseBlocksGradeBandsElementary(),
      description: i18n.courseBlocksGradeBandsElementaryDescription(),
      path: '/educate/curriculum/elementary-school'
    },
    {
      heading: i18n.courseBlocksGradeBandsMiddle(),
      description: i18n.courseBlocksGradeBandsMiddleDescription(),
      path: '/educate/curriculum/middle-school'
    },
    {
      heading: i18n.courseBlocksGradeBandsHigh(),
      description: i18n.courseBlocksGradeBandsHighDescription(),
      path: '/educate/curriculum/high-school'
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

export default CourseBlocksStudentGradeBands;
