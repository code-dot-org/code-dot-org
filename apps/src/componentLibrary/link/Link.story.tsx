import React from 'react';
import Link, {LinkProps} from './index';
import {Meta, Story} from '@storybook/react';
// import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

export default {
  title: 'DesignSystem/Link Component',
  component: Link,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: Story<LinkProps> = args => <Link {...args} />;

const MultipleTemplate: Story<{
  components: LinkProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      // TODO: fix key
      <Link key={componentArg.size} {...componentArg} />
    ))}
  </>
);

export const DefaultLink = SingleTemplate.bind({});
DefaultLink.args = {
  children: 'Default Link',
  size: 'm',
};

export const GroupOfSizesOfLinks = MultipleTemplate.bind({});
GroupOfSizesOfLinks.args = {
  components: [
    {
      children: 'Link XS',
      href: '#',
      size: 'xs',
    },
    {
      children: 'Link S',
      href: '#',

      size: 's',
    },
    {
      children: 'Link M',
      href: '#',

      size: 'm',
    },
    {
      children: 'Link L',
      href: '#',
      size: 'l',
    },
  ],
};
