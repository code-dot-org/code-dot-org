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
    isTeacher: PropTypes.bool,
  };

  static defaultProps = {
    isEnglish: true,
  };

  render() {
    const {isEnglish, isTeacher} = this.props;
    const headingText = isTeacher
      ? i18n.teacherAnnouncementSpecialWinter2021Heading()
      : i18n.announcementHoc2023DanceAIHeading();
    const descriptionText = isTeacher
      ? i18n.teacherAnnouncementSpecialWinter2021Body()
      : i18n.announcementHoc2023DanceAIBody();
    const buttonId = isTeacher
      ? 'teacher_homepage_announcement_special_winter2021'
      : 'student_homepage_announcement_special2020';
    const url = isTeacher && isEnglish ? pegasus('/dance') : pegasus('/dance');
    const buttonText =
      isTeacher && isEnglish ? i18n.joinUs() : i18n.learnMore();
    const imageUrl =
      isTeacher && isEnglish
        ? pegasus('/images/dance-hoc/dance-party-activity-ai-edition.png')
        : pegasus('/images/dance-hoc/dance-party-activity-ai-edition.png');

    return (
      <TwoColumnActionBlock
        imageUrl={imageUrl}
        subHeading={headingText}
        description={descriptionText}
        buttons={[
          {
            id: buttonId,
            url: url,
            text: buttonText,
          },
        ]}
      />
    );
  }
}
