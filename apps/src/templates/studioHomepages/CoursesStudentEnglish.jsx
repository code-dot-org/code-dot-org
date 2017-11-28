import React, {Component, PropTypes} from 'react';
import ContentContainer from '../ContentContainer';
import {LocalClassActionBlock} from './TwoColumnActionBlock';
import {CourseBlocksHoc} from './CourseBlocks';
import CourseBlocksStudentGradeBands from './CourseBlocksStudentGradeBands';
import Responsive from '../../responsive';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

/**
 * This is the main content for the Courses page for a student using English,
 * as well as the default for a signed-out user using English.
 */
class CoursesStudentEnglish extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  };

  render() {
    const { isRtl, responsive } = this.props;

    return (
      <div>
        <CourseBlocksStudentGradeBands
          isRtl={isRtl}
          showContainer={true}
          hideBottomMargin={false}
        />

        <ContentContainer
          heading={i18n.teacherCourseHoc()}
          description={i18n.teacherCourseHocDescription()}
          isRtl={isRtl}
          linkText={i18n.teacherCourseHocLinkText()}
          link={pegasus('/hourofcode/overview')}
        >
          <CourseBlocksHoc rowCount={1}/>
        </ContentContainer>

        <LocalClassActionBlock
          isRtl={isRtl}
          responsive={responsive}
          showHeading={true}
        />
      </div>
    );
  }
}

export default CoursesStudentEnglish;
