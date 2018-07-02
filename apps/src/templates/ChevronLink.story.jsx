import React from 'react';
import SmallChevronLink from './SmallChevronLink';
import LargeChevronLink from './LargeChevronLink';
import i18n from "@cdo/locale";

export default storybook => {
  return storybook
    .storiesOf('ChevronLinks', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Small teal chevron link',
        description: `Used throughout the site for navigation`,
        story: () => (
          <SmallChevronLink
            link={'/foo'}
            linkText={i18n.viewCourse()}
            isRtl={false}
          />
        )
      },
      {
        name: 'Large teal chevron link',
        description: `Currently used on /congrats`,
        story: () => (
          <LargeChevronLink
            link={'/foo'}
            linkText={i18n.viewCourse()}
            isRtl={false}
          />
        )
      },
    ]);
};
