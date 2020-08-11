import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import {CourseBlocksIntl} from './CourseBlocks';
import CoursesTeacherEnglish from './CoursesTeacherEnglish';
import CoursesStudentEnglish from './CoursesStudentEnglish';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import SpecialAnnouncement from './SpecialAnnouncement';
import {SpecialAnnouncementActionBlock} from './TwoColumnActionBlock';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import styleConstants from '@cdo/apps/styleConstants';
import shapes from './shapes';

const styles = {
  content: {
    maxWidth: styleConstants['content-width']
  }
};

class Courses extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    isSignedOut: PropTypes.bool.isRequired,
    linesCount: PropTypes.string.isRequired,
    studentsCount: PropTypes.string.isRequired,
    modernElementaryCoursesAvailable: PropTypes.bool.isRequired,
    specialAnnouncement: shapes.specialAnnouncement
  };

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('#flashes')
      .appendTo(ReactDOM.findDOMNode(this.refs.flashes))
      .show();
  }

  getHeroStrings() {
    const {isTeacher, isSignedOut, studentsCount} = this.props;

    // Default to "Learn" view strings
    let heroStrings = {
      headingText: i18n.coursesLearnHeroHeading(),
      subHeadingText: i18n.coursesLearnHeroSubHeading({studentsCount}),
      buttonText: i18n.coursesLearnHeroButton()
    };

    // Apply overrides if this is the "Teach" view
    if (isTeacher) {
      heroStrings = {
        headingText: i18n.coursesTeachHeroHeading(),
        subHeadingText: i18n.coursesTeachHeroSubHeading(),
        buttonText: i18n.coursesTeachHeroButton()
      };
    }

    // We show a long version of the banner when you're signed out,
    // so add a description string.
    if (isSignedOut) {
      heroStrings.description = isTeacher
        ? i18n.coursesTeachHeroDescription()
        : i18n.coursesLearnHeroDescription();
    }
    return heroStrings;
  }

  render() {
    const {
      isEnglish,
      isTeacher,
      isSignedOut,
      modernElementaryCoursesAvailable,
      specialAnnouncement
    } = this.props;

    const {
      headingText,
      subHeadingText,
      description,
      buttonText
    } = this.getHeroStrings();

    // Verify background image works for both LTR and RTL languages.
    const backgroundUrl = isTeacher
      ? '/shared/images/banners/courses-hero-teacher.jpg'
      : '/shared/images/banners/courses-hero-student.jpg';

    return (
      <div>
        <HeaderBanner
          headingText={headingText}
          subHeadingText={subHeadingText}
          description={description}
          short={!isSignedOut}
          backgroundUrl={backgroundUrl}
        >
          {isSignedOut && (
            <Button
              __useDeprecatedTag
              href="/users/sign_up"
              color={Button.ButtonColor.gray}
              text={buttonText}
            />
          )}
        </HeaderBanner>
        <div className={'contentContainer'}>
          <div className={'content'} style={styles.content}>
            <ProtectedStatefulDiv ref="flashes" />

            {/* English, teacher.  (Also can be shown when signed out.) */}
            {isEnglish && isTeacher && (
              <div className={'announcements'}>
                {specialAnnouncement && (
                  <SpecialAnnouncementActionBlock
                    announcement={specialAnnouncement}
                  />
                )}
                <CoursesTeacherEnglish />
              </div>
            )}

            {/* English, student.  (Also the default to be shown when signed out.) */}
            {isEnglish && !isTeacher && (
              <div className={'announcements'}>
                <SpecialAnnouncement isTeacher={isTeacher} />
                <CoursesStudentEnglish />
              </div>
            )}

            {/* Non-English */}
            {!isEnglish && (
              <CourseBlocksIntl
                isTeacher={isTeacher}
                showModernElementaryCourses={modernElementaryCoursesAvailable}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Courses;
