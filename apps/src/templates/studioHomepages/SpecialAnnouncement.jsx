import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {TwoColumnActionBlock} from './TwoColumnActionBlock';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

/* This component differs from the SpecialAnnouncementActionBlock because it
is not managed by the json system and can therefore be fully translated and
can be shown to users viewing the site in languages other than English. */
export default class SpecialAnnouncement extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool,
    isTeacher: PropTypes.bool
  };

  static defaultProps = {
    isEnglish: true
  };

  render() {
    const {isEnglish, isTeacher} = this.props;
    const headingText = isEnglish
      ? isTeacher
        ? 'The Hour of Code is here!'
        : i18n.studentAnnouncementSpecial2020Heading()
      : i18n.intlAnnouncementSpecial2020Heading();
    const descriptionText = isEnglish
      ? isTeacher
        ? "Whether you're in the classroom or at home, join us for the Hour of Code! Explore how AI impacts our world with our new AI resources, tune in to a CodeBytes mini-lesson, or try one of hundreds of other activities!"
        : i18n.studentAnnouncementSpecial2020Body()
      : i18n.intlAnnouncementSpecial2020Body();
    const buttonId = isTeacher
      ? 'teacher_homepage_announcement_special2020'
      : 'student_homepage_announcement_special2020';
    const url =
      isTeacher && isEnglish
        ? pegasus('/hourofcode/overview')
        : pegasus('/athome');
    const buttonText =
      isTeacher && isEnglish
        ? 'Join Us'
        : i18n.studentAnnouncementSpecial2020Button();
    const imageUrl =
      isTeacher && isEnglish
        ? pegasus(
            '/shared/images/fill-540x300/announcement/announcement_hoc2020_ai.png'
          )
        : pegasus(
            '/shared/images/fill-540x300/announcement/announcement_special_fall2020.jpg'
          );

    return (
      <TwoColumnActionBlock
        imageUrl={imageUrl}
        subHeading={headingText}
        description={descriptionText}
        buttons={[
          {
            id: buttonId,
            url: url,
            text: buttonText
          }
        ]}
      />
    );
  }
}
