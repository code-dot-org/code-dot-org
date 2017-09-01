import React, {Component, PropTypes} from 'react';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import ContentContainer from '../ContentContainer';
import i18n from "@cdo/locale";

class CourseBlocksStudentGradeBands extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired
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
      <ContentContainer
        link={'/home/#recent-courses'}
        linkText={i18n.viewMyRecentCourses()}
        heading={i18n.courseBlocksGradeBandsContainerHeading()}
        description={i18n.courseBlocksGradeBandsContainerDescription()}
        isRtl={this.props.isRtl}
      >
        <CourseBlocksGradeBands
          cards={this.cards}
          isRtl={this.props.isRtl}
        />
      </ContentContainer>
    );
  }
}

export default CourseBlocksStudentGradeBands;
