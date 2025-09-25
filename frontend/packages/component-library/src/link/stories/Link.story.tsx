import {Meta, StoryFn} from '@storybook/react-webpack5';

import Link, {LinkProps} from '../index';

export default {
  title: 'DesignSystem/Link',
  component: Link,
} as Meta;

const SingleTemplate: StoryFn<LinkProps> = args => <Link {...args} />;

const MultipleTemplate: StoryFn<{
  components: LinkProps[];
}> = args => (
  <>
    <p>
      * Margins on this screen do not represent Component's margins, and are
      only added to improve storybook view *
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

export const ExternalLink = SingleTemplate.bind({});
ExternalLink.args = {
  text: 'External Link',
  href: 'https://google.com',
  external: true,
};

export const OpenInNewTabLink = SingleTemplate.bind({});
OpenInNewTabLink.args = {
  text: 'Open in New Tab',
  href: 'https://google.com',
  openInNewTab: true,
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
      type: 'primary',
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
    {children: 'Link XS', href: '#', size: 'xs'},
    {children: 'Link S', href: '#', size: 's'},
    {children: 'Link M', href: '#', size: 'm'},
    {children: 'Link L', href: '#', size: 'l'},
  ],
};
