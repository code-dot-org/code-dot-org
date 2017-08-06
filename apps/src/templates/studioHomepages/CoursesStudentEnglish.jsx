import React from 'react';
import ContentContainer from '../ContentContainer';
import FindLocalClassBanner from './FindLocalClassBanner';
import {CourseBlocksHoc} from './CourseBlocks';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import i18n from "@cdo/locale";

/**
 * This is the main content for the Courses page for a student using English,
 * though it may also be shown for a signed-out user using English, and is in
 * fact the default in such a case.
 */
const CoursesStudentEnglish = React.createClass({
  propTypes: {
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {
    const { codeOrgUrlPrefix, isRtl } = this.props;

    return (
      <div>
        <CourseBlocksGradeBands
          isEnglish={true}
          isRtl={isRtl}
          codeOrgUrlPrefix={codeOrgUrlPrefix}
        />

        <ContentContainer
          heading={i18n.teacherCourseHoc()}
          description={i18n.teacherCourseHocDescription()}
          isRtl={isRtl}
          linkText={i18n.teacherCourseHocLinkText()}
          link={`${codeOrgUrlPrefix}/learn`}
        >
          <CourseBlocksHoc rowCount={1}/>
        </ContentContainer>

        <FindLocalClassBanner
          codeOrgUrlPrefix={codeOrgUrlPrefix}
          isRtl={isRtl}
        />
      </div>
    );
  }
});

export default CoursesStudentEnglish;
