import React from 'react';
import Link, {LinkProps} from './index';
import {Meta, Story} from '@storybook/react';

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
  children: 'Default Link',
  href: '#',
  onClick: e => {
    e.preventDefault();
    alert('clicked');
  },
  size: 'm',
};

export const DisabledLink = SingleTemplate.bind({});
DisabledLink.args = {
  children: 'Disabled Link',
  onClick: e => {
    e.preventDefault();
    alert('clicked');
  },
  disabled: true,
  size: 'm',
};

export const GroupOfTypesOfLinks = MultipleTemplate.bind({});
GroupOfTypesOfLinks.args = {
  components: [
    {
      children: 'Link M Primary',
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
