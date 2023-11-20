import React from 'react';
import LargeChevronLink from './LargeChevronLink';
import i18n from '@cdo/locale';

export default storybook => {
  return storybook
    .storiesOf('LargeChevronLink', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Large teal chevron link',
        description: `Currently used on /congrats`,
        story: () => (
          <LargeChevronLink
            link={'/foo'}
            linkText={i18n.viewCourse()}
            isRtl={false}
          />
        ),
      },
    ]);
};
