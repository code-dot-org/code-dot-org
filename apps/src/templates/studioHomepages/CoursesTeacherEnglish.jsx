import $ from 'jquery';
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import ContentContainer from '../ContentContainer';
import UiTips from '@cdo/apps/templates/studioHomepages/UiTips';
import {AdministratorResourcesActionBlock} from './TwoColumnActionBlock';
import { CourseBlocksHoc } from './CourseBlocks';
import CourseBlocksTools from './CourseBlocksTools';
import CourseBlocksTeacherGradeBands from './CourseBlocksTeacherGradeBands';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import Responsive from '../../responsive';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

/**
 * This is the main content for the Courses page for a teacher using English,
 * though it may also be shown for a signed-out user using English.
 */
class CoursesTeacherEnglish extends Component {
  static propTypes = {
    isSignedOut: PropTypes.bool.isRequired,
    showInitialTips: PropTypes.bool.isRequired,
    userId: PropTypes.number,
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  };

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('.courseexplorer').appendTo(ReactDOM.findDOMNode(this.refs.courseExplorer)).show();
  }

  render() {
    const { isSignedOut, showInitialTips, userId, isRtl, responsive } = this.props;
    return (
      <div>
        {(!isSignedOut &&
          <UiTips
            userId={userId}
            tipId={"teacher_courses"}
            showInitialTips={showInitialTips}
            tips={
              [
                {
                  type: "initial",
                  position: {top: 0, left: 0, position: "relative"},
                  text: i18n.coursesUiTipsTeacherCourses(),
                  arrowDirection: "down",
                  scrollTo: ".courseexplorer"
                }
              ]
            }
          />
        )}

        <div>
          <ContentContainer
            heading={i18n.courseExplorerHeading()}
            description={i18n.courseExplorerDescription()}
            link={'/home/#recent-courses'}
            linkText={i18n.viewMyRecentCourses()}
            isRtl={isRtl}
            responsive={responsive}
          >
            <ProtectedStatefulDiv ref="courseExplorer"/>
          </ContentContainer>

          <CourseBlocksTeacherGradeBands
            isRtl={isRtl}
            responsive={responsive}
          />

          <ContentContainer
            heading={i18n.teacherCourseHoc()}
            description={i18n.teacherCourseHocDescription()}
            isRtl={isRtl}
            linkText={i18n.teacherCourseHocLinkText()}
            link={pegasus('/hourofcode/overview')}
            showLink={true}
            responsive={responsive}
          >
            <CourseBlocksHoc rowCount={1}/>
          </ContentContainer>

          <CourseBlocksTools
            isEnglish={true}
            isRtl={isRtl}
            responsive={responsive}
          />

          <AdministratorResourcesActionBlock/>
        </div>
      </div>
    );
  }
}

export default CoursesTeacherEnglish;
