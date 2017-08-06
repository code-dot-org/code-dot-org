import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ContentContainer from '../ContentContainer';
import UiTips from '@cdo/apps/templates/studioHomepages/UiTips';
import { CourseBlocksHoc } from './CourseBlocks';
import CourseBlocksTools from './CourseBlocksTools';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";

/**
 * This is the main content for the Courses page for a teacher using English,
 * though it may also be shown for a signed-out user using English.
 */
const CoursesTeacherEnglish = React.createClass({
  propTypes: {
    isSignedOut: React.PropTypes.bool.isRequired,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    showInitialTips: React.PropTypes.bool.isRequired,
    userId: React.PropTypes.number,
    isRtl: React.PropTypes.bool.isRequired
  },

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('.courseexplorer').appendTo(ReactDOM.findDOMNode(this.refs.courseExplorer)).show();
  },

  render() {
    const { isSignedOut, codeOrgUrlPrefix, showInitialTips, userId, isRtl } = this.props;
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
            isRtl={isRtl}
          >
            <ProtectedStatefulDiv ref="courseExplorer"/>
          </ContentContainer>

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
            link={`${codeOrgUrlPrefix}/hourofcode/overview`}
            showLink={true}
          >
            <CourseBlocksHoc rowCount={1}/>
          </ContentContainer>

          <CourseBlocksTools
            isEnglish={true}
            isRtl={isRtl}
            codeOrgUrlPrefix={codeOrgUrlPrefix}
          />
        </div>
      </div>
    );
  }
});

export default CoursesTeacherEnglish;
