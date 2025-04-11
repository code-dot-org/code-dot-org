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
  mainLinks: [
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
  projectsButtonLabel: 'New Project',
  projectsLinks: [
    {
      key: 'spriteLab',
      label: 'Sprite Lab',
      href: '/projects',
      image: '/images/sprite-lab.png',
    },
    {
      key: 'artist',
      label: 'Artist',
      href: '/lessons',
      image: '/images/artist.png',
    },
    {
      key: 'appLab',
      label: 'App Lab',
      href: '/curriculum',
      image: '/images/app-lab.png',
    },
    {
      key: 'gameLab',
      label: 'Game Lab',
      href: '/resources',
      image: '/images/game-lab.png',
    },
    {
      key: 'musicLab',
      label: 'Music Lab',
      href: '/resources',
      image: '/images/music-lab.png',
    },
    {
      key: 'danceParty',
      label: 'Dance Party',
      href: '/resources',
      image: '/images/dance-party.png',
    },
    {
      key: 'viewAllProjects',
      label: 'View All Projects',
      href: '/resources',
      image: '/images/view-all-projects.png',
    },
  ],
  accountLinks: {
    signIn: {
      label: 'Sign In',
      href: 'https://studio.code.org/users/sign_in',
    },
    createAccount: {
      label: 'Create Account',
      href: 'https://studio.code.org/users/sign_up/account_type',
    },
    goToDashboard: {
      label: 'Go to Dashboard',
      href: 'https://studio.code.org/home',
    },
  },
  isLoggedIn: false,
  helpMenuLabel: 'Help',
  helpLinks: [
    {
      key: 'helpAndSupport',
      label: 'Help and support',
      href: 'https://support.code.org/',
    },
    {
      key: 'reportAProblem',
      label: 'Report a problem',
      href: 'https://support.code.org/hc/en-us/requests/new',
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
