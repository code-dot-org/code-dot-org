import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import { CourseBlocksAll } from './CourseBlocks';
import CoursesTeacherEnglish from './CoursesTeacherEnglish';
import CoursesStudentEnglish from './CoursesStudentEnglish';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import Button from '@cdo/apps/templates/Button';
import i18n from "@cdo/locale";

const Courses = React.createClass({
  propTypes: {
    isEnglish: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired,
    isSignedOut: React.PropTypes.bool.isRequired,
    linesCount: React.PropTypes.string.isRequired,
    studentsCount: React.PropTypes.string.isRequired,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    showInitialTips: React.PropTypes.bool.isRequired,
    userId: React.PropTypes.number,
    isRtl: React.PropTypes.bool.isRequired
  },

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();
  },

  render() {
    const { isEnglish, isTeacher, isSignedOut, codeOrgUrlPrefix, userId, showInitialTips, isRtl } = this.props;
    const headingText = isSignedOut ? i18n.coursesCodeStudio() : i18n.courses();
    const subHeadingText = i18n.coursesHeadingSubText(
      {linesCount: this.props.linesCount, studentsCount: this.props.studentsCount}
    );
    const headingDescription = isSignedOut ? i18n.coursesHeadingDescription() : null;

    return (
      <div>
        <HeaderBanner
          headingText={headingText}
          subHeadingText={subHeadingText}
          description={headingDescription}
          short={!isSignedOut}
        >
          {isSignedOut && (
            <Button
              href= "/users/sign_up"
              color={Button.ButtonColor.gray}
              text={i18n.createAccount()}
            />
          )}
        </HeaderBanner>

        <ProtectedStatefulDiv
          ref="flashes"
        />

        {/* English, teacher.  (Also can be shown when signed out.) */}
        {(isEnglish && isTeacher) && (
          <CoursesTeacherEnglish
            isSignedOut={isSignedOut}
            codeOrgUrlPrefix={codeOrgUrlPrefix}
            showInitialTips={showInitialTips}
            userId={userId}
            isRtl={isRtl}
          />
        )}

        {/* English, student.  (Also the default to be shown when signed out.) */}
        {(isEnglish && !isTeacher) && (
          <CoursesStudentEnglish
            codeOrgUrlPrefix={codeOrgUrlPrefix}
            isRtl={isRtl}
          />
        )}

        {/* Non-English */}
        {(!isEnglish) && (
          <CourseBlocksAll
            isEnglish={false}
            isRtl={isRtl}
            codeOrgUrlPrefix={codeOrgUrlPrefix}
          />
        )}
      </div>
    );
  }
});

export default Courses;
