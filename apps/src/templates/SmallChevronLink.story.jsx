import React from 'react';
import {SmallChevronLink} from './SmallChevronLink';

export default storybook => {
  return storybook.storiesOf('SmallChevronLink', module).addStoryTable([
    {
      name: 'Default',
      description: 'Used throughout the site for navigation',
      story: () => <SmallChevronLink href="/foo" text="View course" />,
    },
    {
      name: 'Icon before text',
      story: () => (
        <SmallChevronLink href="/foo" text="View course" iconBefore />
      ),
    },
  ]);
};
