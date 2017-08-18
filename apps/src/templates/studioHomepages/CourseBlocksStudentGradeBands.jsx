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
