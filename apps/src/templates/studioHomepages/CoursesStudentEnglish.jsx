import React, {Component} from 'react';
import {LocalClassActionBlock} from './TwoColumnActionBlock';
import {CourseBlocksHoc} from './CourseBlocks';
import CourseBlocksStudentGradeBands from './CourseBlocksStudentGradeBands';

/**
 * This is the main content for the Courses page for a student using English,
 * as well as the default for a signed-out user using English.
 */
class CoursesStudentEnglish extends Component {
  render() {
    return (
      <div>
        <CourseBlocksStudentGradeBands
          showContainer={true}
          hideBottomMargin={false}
        />

        <CourseBlocksHoc />

        <LocalClassActionBlock showHeading={true} />
      </div>
    );
  }
}

export default CoursesStudentEnglish;
