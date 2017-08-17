import React, {Component, PropTypes} from 'react';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import i18n from "@cdo/locale";

class CourseBlocksStudentGradeBands extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired
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
      />
    );
  }
}

export default CourseBlocksStudentGradeBands;
