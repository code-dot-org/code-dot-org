import $ from 'jquery';
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import { CourseBlocksAll } from './CourseBlocks';
import CoursesTeacherEnglish from './CoursesTeacherEnglish';
import CoursesStudentEnglish from './CoursesStudentEnglish';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import Button from '@cdo/apps/templates/Button';
import i18n from "@cdo/locale";
import styleConstants from '@cdo/apps/styleConstants';

const styles = {
  content: {
    width: '100%',
    maxWidth: styleConstants['content-width'],
    marginLeft: 'auto',
    marginRight: 'auto',
  }
};

class Courses extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    isSignedOut: PropTypes.bool.isRequired,
    linesCount: PropTypes.string.isRequired,
    studentsCount: PropTypes.string.isRequired,
    showInitialTips: PropTypes.bool.isRequired,
    userId: PropTypes.number,
  };

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();
  }

  render() {
    const { isEnglish, isTeacher, isSignedOut, userId, showInitialTips } = this.props;
    const headingText = isTeacher ? i18n.coursesHeadingTeacher() : i18n.coursesHeadingStudent();
    const subHeadingText = i18n.coursesHeadingSubText(
      {linesCount: this.props.linesCount, studentsCount: this.props.studentsCount}
    );
    const headingDescription = isSignedOut ? i18n.coursesHeadingDescription() : null;

    return (
      <div style={styles.content}>
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
            showInitialTips={showInitialTips}
            userId={userId}
          />
        )}

        {/* English, student.  (Also the default to be shown when signed out.) */}
        {(isEnglish && !isTeacher) && (
          <CoursesStudentEnglish/>
        )}

        {/* Non-English */}
        {(!isEnglish) && (
          <CourseBlocksAll
            isEnglish={false}
          />
        )}
      </div>
    );
  }
}

export default Courses;
