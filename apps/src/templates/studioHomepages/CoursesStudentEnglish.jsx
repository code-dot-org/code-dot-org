import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ContentContainer from '../ContentContainer';
import {LocalClassActionBlock} from './TwoColumnActionBlock';
import {CourseBlocksHoc} from './CourseBlocks';
import CourseBlocksStudentGradeBands from './CourseBlocksStudentGradeBands';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

/**
 * This is the main content for the Courses page for a student using English,
 * as well as the default for a signed-out user using English.
 */
class CoursesStudentEnglish extends Component {
  static propTypes = {
    showOceans: PropTypes.bool
  };

  render() {
    return (
      <div>
        <CourseBlocksStudentGradeBands
          showContainer={true}
          hideBottomMargin={false}
        />

        <ContentContainer
          heading={i18n.teacherCourseHoc()}
          description={i18n.teacherCourseHocDescription()}
          linkText={i18n.teacherCourseHocLinkText()}
          link={pegasus('/hourofcode/overview')}
        >
          <CourseBlocksHoc showOceans={this.props.showOceans} />
        </ContentContainer>

        <LocalClassActionBlock showHeading={true} />
      </div>
    );
  }
}

export default CoursesStudentEnglish;
