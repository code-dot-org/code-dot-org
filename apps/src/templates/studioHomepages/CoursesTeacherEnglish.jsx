import $ from 'jquery';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import ContentContainer from '../ContentContainer';
import {AdministratorResourcesActionBlock} from './TwoColumnActionBlock';
import {CourseBlocksHoc} from './CourseBlocks';
import CourseBlocksTools from './CourseBlocksTools';
import CourseBlocksTeacherGradeBands from './CourseBlocksTeacherGradeBands';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from '@cdo/locale';

/**
 * This is the main content for the Courses page for a teacher using English,
 * though it may also be shown for a signed-out user using English.
 */
class CoursesTeacherEnglish extends Component {
  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('.courseexplorer')
      .appendTo(ReactDOM.findDOMNode(this.refs.courseExplorer))
      .show();
  }

  render() {
    return (
      <div>
        <div>
          <ContentContainer
            heading={i18n.courseExplorerHeading()}
            description={i18n.courseExplorerDescription()}
            link={'/home/#recent-courses'}
            linkText={i18n.viewMyRecentCourses()}
          >
            <ProtectedStatefulDiv ref="courseExplorer" />
          </ContentContainer>

          <CourseBlocksTeacherGradeBands />

          <CourseBlocksHoc />

          <CourseBlocksTools isEnglish={true} />

          <AdministratorResourcesActionBlock />
        </div>
      </div>
    );
  }
}

export default CoursesTeacherEnglish;
