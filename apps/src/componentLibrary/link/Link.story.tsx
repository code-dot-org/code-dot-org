import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Link, {LinkProps} from './index';

export default {
  title: 'DesignSystem/Link', // eslint-disable-line storybook/no-title-property-in-meta
  component: Link,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<LinkProps> = args => <Link {...args} />;

const MultipleTemplate: StoryFn<{
  components: LinkProps[];
}> = args => (
  <>
    <p>
      * Margins on this screen does not represent Component's margins, and are
      only added to improve storybook view *{' '}
    </p>
    <p>Multiple Links:</p>
    <div style={{display: 'flex', gap: '20px'}}>
      {args.components?.map(componentArg => (
        <Link key={`${componentArg.children}`} {...componentArg} />
      ))}
    </div>
  </>
);

export const DefaultLink = SingleTemplate.bind({});
DefaultLink.args = {
  text: 'Default Link',
  href: '#',
  onClick: e => {
    e.preventDefault();
    alert('clicked');
  },
  size: 'm',
};

export const DisabledLink = SingleTemplate.bind({});
DisabledLink.args = {
  text: 'Disabled Link',
  onClick: e => {
    e.preventDefault();
    alert('clicked');
  },
  disabled: true,
  size: 'm',
};

export const LinkWithTextPropVsLinkWithChildrenProp = MultipleTemplate.bind({});
LinkWithTextPropVsLinkWithChildrenProp.args = {
  components: [
    {
      text: 'Link Text Prop',
      href: '#',
    },
    {
      children: 'Link Children Prop',
      href: '#',
    },
    {
      children: <em>Link Children Prop (with em tag)</em>,
      href: '#',
    },
  ],
};

export const GroupOfTypesOfLinks = MultipleTemplate.bind({});
GroupOfTypesOfLinks.args = {
  components: [
    {
      text: 'Link M Primary',
      href: '#',
      size: 'm',
    },
    {
      children: 'Link M Secondary',
      href: '#',
      type: 'secondary',
      size: 'm',
    },
  ],
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
