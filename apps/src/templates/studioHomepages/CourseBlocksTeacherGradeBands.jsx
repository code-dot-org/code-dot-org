import React, {Component} from 'react';
import ContentContainer from '../ContentContainer';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import i18n from "@cdo/locale";

class CourseBlocksTeacherGradeBands extends Component {
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
        heading={i18n.courseBlocksGradeBandsContainerHeading()}
        description={i18n.courseBlocksGradeBandsContainerDescription()}
      >
        <CourseBlocksGradeBands
          cards={this.cards}
        />
      </ContentContainer>
    );
  }
}

export default CourseBlocksTeacherGradeBands;
