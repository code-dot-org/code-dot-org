import React, {Component} from 'react';

import {pegasus} from '@cdo/apps/util/urlHelpers';
import i18n from '@cdo/locale';

import TwoColumnActionBlock from './TwoColumnActionBlock';

/*
This component differs from the SpecialAnnouncementActionBlock because it
is not managed by the json system and can therefore be fully translated and
can be shown to users viewing the site in languages other than English.

Note as of Nov 2023: this component may no longer be needed and can be replaced
by the MarketingAnnouncementBanner component on the StudentHomepage component.
*/
export default class SpecialAnnouncement extends Component {
  render() {
    const headingText = i18n.announcementHoc2023DanceAIHeading();
    const descriptionText = i18n.announcementHoc2023DanceAIBody();
    const buttonId = 'student_homepage_announcement_special2020';
    const url = pegasus('/dance');
    const buttonText = i18n.learnMore();
    const imageUrl = pegasus(
      '/images/dance-hoc/dance-party-activity-ai-edition.png'
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
            text: buttonText,
          },
        ]}
      />
    );
  }
}
