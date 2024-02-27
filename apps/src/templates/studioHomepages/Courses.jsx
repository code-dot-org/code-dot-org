import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import {CourseBlocksIntl} from './CourseBlocks';
import CoursesStudentEnglish from './CoursesStudentEnglish';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import styleConstants from '@cdo/apps/styleConstants';
import color from '../../util/color';
import fontConstants from '@cdo/apps/fontConstants';
import shapes from './shapes';
import MarketingAnnouncementBanner from './MarketingAnnouncementBanner';

class Courses extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired,
    isSignedOut: PropTypes.bool.isRequired,
    studentsCount: PropTypes.string.isRequired,
    modernElementaryCoursesAvailable: PropTypes.bool.isRequired,
    showAiCard: PropTypes.bool,
    specialAnnouncement: shapes.specialAnnouncement,
  };

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();
  }

  getHeroStrings() {
    const {isSignedOut, studentsCount} = this.props;

    // Default to "Learn" view strings
    let heroStrings = {
      headingText: i18n.coursesLearnHeroHeading(),
      subHeadingText: i18n.coursesLearnHeroSubHeading({studentsCount}),
      buttonText: i18n.coursesLearnHeroButton(),
    };

    // We show a long version of the banner when you're signed out,
    // so add a description string.
    if (isSignedOut) {
      heroStrings.description = i18n.coursesLearnHeroDescription();
    }
    return heroStrings;
  }

  render() {
    const {
      isEnglish,
      isSignedOut,
      modernElementaryCoursesAvailable,
      specialAnnouncement,
    } = this.props;

    const {headingText, subHeadingText, description, buttonText} =
      this.getHeroStrings();

    // Verify background image works for both LTR and RTL languages.
    const backgroundUrl = '/shared/images/banners/courses-hero-student.jpg';

    return (
      <div>
        <HeaderBanner
          headingText={headingText}
          subHeadingText={subHeadingText}
          description={description}
          backgroundUrl={backgroundUrl}
          backgroundImageStyling={{backgroundPosition: '40% 40%'}}
        >
          {isSignedOut && (
            <Button
              __useDeprecatedTag
              href="/users/sign_up"
              className="bannerContentButton"
              color={Button.ButtonColor.gray}
              style={styles.headerButton}
              text={buttonText}
            />
          )}
        </HeaderBanner>
        <div className={'contentContainer'}>
          <div className={'content'} style={styles.content}>
            <ProtectedStatefulDiv ref="flashes" />

            {/* English */}
            {isEnglish && (
              <div className={'announcements'}>
                {specialAnnouncement && (
                  <MarketingAnnouncementBanner
                    announcement={specialAnnouncement}
                    marginBottom="60px"
                  />
                )}
                <CoursesStudentEnglish />
              </div>
            )}

            {/* Non-English */}
            {!isEnglish && (
              <CourseBlocksIntl
                showModernElementaryCourses={modernElementaryCoursesAvailable}
                specialAnnouncement={specialAnnouncement}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  content: {
    maxWidth: styleConstants['content-width'],
  },
  headerButton: {
    margin: 'unset',
    backgroundColor: color.white,
    borderColor: color.white,
    color: color.neutral_dark,
    ...fontConstants['main-font-semi-bold'],
    width: 'fit-content',
  },
};

export default Courses;
