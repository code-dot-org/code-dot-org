import React, {Component} from 'react';
import {CourseBlocksHoc} from './CourseBlocks';
import CourseBlocksWrapper from '@cdo/apps/templates/studioHomepages/CourseBlocksWrapper';
import {StudentGradeBandCards} from '@cdo/apps/util/courseBlockCardsConstants';
import i18n from '@cdo/locale';

/**
 * This is the main content for the Courses page for a student using English,
 * as well as the default for a signed-out user using English.
 */
class CoursesStudentEnglish extends Component {
  render() {
    return (
      <div>
        <CourseBlocksWrapper
          cards={StudentGradeBandCards}
          heading={i18n.courseBlocksGradeBandsContainerHeading()}
          description={i18n.courseBlocksGradeBandsContainerDescription()}
          link={'/home/#recent-courses'}
          linkText={i18n.viewMyRecentCourses()}
          hideBottomMargin={false}
        />

        <CourseBlocksHoc />
      </div>
    );
  }
}

export default CoursesStudentEnglish;
