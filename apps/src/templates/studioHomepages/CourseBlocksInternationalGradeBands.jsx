import React, {Component} from 'react';
import ContentContainer from '../ContentContainer';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import i18n from "@cdo/locale";

class CourseBlocksInternationalGradeBands extends Component {
  cards = [
    {
      linkId: 'course-block-international-grade-band-4-10',
      linkClass: 'linktag',
      heading: i18n.courseBlocksInternationalGradeBandsElementary(),
      description: i18n.courseBlocksInternationalGradeBandsElementaryDescription(),
      path: '/educate/curriculum/elementary-school'
    },
    {
      linkId: 'course-block-international-grade-band-10-14',
      linkClass: 'linktag',
      heading: i18n.courseBlocksInternationalGradeBandsMiddle(),
      description: i18n.courseBlocksInternationalGradeBandsMiddleDescription(),
      path: '/educate/curriculum/middle-school'
    },
    {
      linkId: 'course-block-international-grade-band-12-18',
      linkClass: 'linktag',
      heading: i18n.courseBlocksInternationalGradeBandsHigh(),
      description: i18n.courseBlocksInternationalGradeBandsHighDescription(),
      path: '/educate/curriculum/high-school'
    }
  ];

  render() {
    return (
      <ContentContainer
        heading={i18n.courseBlocksInternationalGradeBandsContainerHeading()}
        description={i18n.courseBlocksInternationalGradeBandsContainerDescription()}
      >
        <CourseBlocksGradeBands
          cards={this.cards}
        />
      </ContentContainer>
    );
  }
}

export default CourseBlocksInternationalGradeBands;
