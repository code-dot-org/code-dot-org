import React from 'react';
import TwoColumnActionBlock from './TwoColumnActionBlock';
import LocalClassActionBlock from './studioHomepages/LocalClassActionBlock';
import AdministratorResources from './studioHomepages/AdministratorResources';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export default storybook => {
  return storybook
    .storiesOf('TwoColumnActionBlock', module)
    .addStoryTable([
      {
        name: 'Local Class Action Block',
        description: 'Example LocalClassActionBlock',
        story: () => (
          <LocalClassActionBlock
            showHeading={true}
          />
        )
      },
      {
        name: 'Administrator Resources Action Block',
        description: 'Example AdministratorResources',
        story: () => (
          <AdministratorResources
            showHeading={true}
          />
        )
      },
      {
        name: 'Special Announcement Action Block',
        description: 'Example Special Announcement',
        story: () => (
          <TwoColumnActionBlock>
            isRtl={false}
            imageUrl={pegasus('/images/mc/fill-540x289/special-announcement-hoc2017.jpg')}
            heading={i18n.specialAnnouncementHeading()}
            subHeading={""}
            description={i18n.specialAnnouncementDescription()}
            buttons={[
              {url: 'https://hourofcode.com/#join', text: i18n.joinUs()},
              {url: pegasus('/minecraft'), text: i18n.tryIt()}
            ]}
          </TwoColumnActionBlock>
        )
      }
    ]);
};
