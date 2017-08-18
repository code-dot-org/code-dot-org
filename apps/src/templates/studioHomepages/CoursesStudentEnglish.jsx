import React, {Component, PropTypes} from 'react';
import ContentContainer from '../ContentContainer';
import FindLocalClassBanner from './FindLocalClassBanner';
import {CourseBlocksHoc} from './CourseBlocks';
import CourseBlocksStudentGradeBands from './CourseBlocksStudentGradeBands';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

/**
 * This is the main content for the Courses page for a student using English,
 * as well as the default for a signed-out user using English.
 */
class CoursesStudentEnglish extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired
  };

  render() {
    const { isRtl } = this.props;

    return (
      <div>
        <ContentContainer
          link={'/home/#recent-courses'}
          linkText={i18n.viewMyRecentCourses()}
          isRtl={isRtl}
        >
          <CourseBlocksStudentGradeBands isRtl={isRtl}/>
        </ContentContainer>

        <ContentContainer
          heading={i18n.teacherCourseHoc()}
          description={i18n.teacherCourseHocDescription()}
          isRtl={isRtl}
          linkText={i18n.teacherCourseHocLinkText()}
          link={pegasus('/hourofcode/overview')}
        >
          <CourseBlocksHoc rowCount={1}/>
        </ContentContainer>

        <FindLocalClassBanner
          isRtl={isRtl}
        />
      </div>
    );
  }
}

export default CoursesStudentEnglish;
