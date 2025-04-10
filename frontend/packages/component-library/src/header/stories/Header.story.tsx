import logoImage from '@public/images/cdo-logo-inverse.svg';
import type {Meta, StoryObj} from '@storybook/react';

import Header, {HeaderProps} from '../Header';

type Story = StoryObj<typeof Header>;

export default {
  title: 'CMS/Header',
  component: Header,
  render: args => <Header {...args} />,
} as Meta<HeaderProps>;

const defaultArgs: HeaderProps = {
  logo: logoImage,
  buttonLabel: {
    newProject: 'New project',
    signIn: 'Sign in',
    createAccount: 'Create account',
    goToDashboard: 'Go to dashboard',
  },
  siteLinks: [
    {
      key: 'learn',
      label: 'Learn',
      href: '/students',
    },
    {
      key: 'teach',
      label: 'Teach',
      href: '/teach',
    },
    {
      key: 'districts',
      label: 'Districts',
      href: '/administrators',
    },
    {
      key: 'stats',
      label: 'Stats',
      href: '/promote',
    },
    {
      key: 'helpUs',
      label: 'Help Us',
      href: '/help',
    },
    {
      key: 'incubator',
      label: 'Incubator',
      href: '/incubator',
    },
    {
      key: 'about',
      label: 'About',
      href: '/about',
    },
  ],
};

//
// STORIES
//
export const Playground: Story = {
  args: {
    ...defaultArgs,
  },
};
