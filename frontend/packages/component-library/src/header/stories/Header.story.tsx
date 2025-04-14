import logoImage from '@public/images/cdo-logo-inverse.svg';
import allProjectsImage from '@public/images/header-all-projects-icon.png';
import appLabImage from '@public/images/header-app-lab-icon.png';
import artistImage from '@public/images/header-artist-icon.png';
import dancePartyImage from '@public/images/header-dance-party-icon.png';
import gameLabImage from '@public/images/header-game-lab-icon.png';
import musicLabImage from '@public/images/header-music-lab-icon.png';
import pythonLabImage from '@public/images/header-python-lab-icon.png';
import spriteLabImage from '@public/images/header-sprite-lab-icon.png';
import type {Meta, StoryObj} from '@storybook/react';

import Header, {HeaderProps} from '../Header';

type Story = StoryObj<typeof Header>;

export default {
  title: 'CMS/Header',
  component: Header,
  render: args => <Header {...args} />,
} as Meta<HeaderProps>;

const defaultArgs: HeaderProps = {
  isLoggedIn: false,
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
      hasDisplayLogic: true,
    },
    {
      key: 'helpUs',
      label: 'Help Us',
      href: '/help',
      hasDisplayLogic: true,
    },
    {
      key: 'incubator',
      label: 'Incubator',
      href: '/incubator',
      hasDisplayLogic: true,
    },
    {
      key: 'about',
      label: 'About',
      href: '/about',
      hasDisplayLogic: true,
    },
  ],
  projectsButtonLabel: 'New Project',
  projectsLinks: [
    {
      key: 'spriteLab',
      label: 'Sprite Lab',
      href: '/projects',
      image: spriteLabImage,
      description: 'Build simple animations',
    },
    {
      key: 'artist',
      label: 'Artist',
      href: '/lessons',
      image: artistImage,
      description: 'Create art with code',
    },
    {
      key: 'appLab',
      label: 'App Lab',
      href: '/curriculum',
      image: appLabImage,
      description: 'Make apps with Javascript',
    },
    {
      key: 'gameLab',
      label: 'Game Lab',
      href: '/resources',
      image: gameLabImage,
      description: 'Build simple games',
    },
    {
      key: 'musicLab',
      label: 'Music Lab',
      href: '/resources',
      image: musicLabImage,
      description: 'Create music with code',
    },
    {
      key: 'danceParty',
      label: 'Dance Party',
      href: '/resources',
      image: dancePartyImage,
      description: 'Make a dance party with AI',
    },
    {
      key: 'pythonLab',
      label: 'Python Lab',
      href: '/resources',
      image: pythonLabImage,
      description: 'Code using Python',
    },
    {
      key: 'viewAllProjects',
      label: 'View All Projects',
      href: '/resources',
      image: allProjectsImage,
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
  helpButtonLabel: 'Help',
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
  hamburgerButtonLabel: 'Hamburger',
  hamburgerLinks: [
    {
      key: 'learn',
      label: 'Learn',
      href: '/students',
      hasDisplayLogic: true,
    },
    {
      key: 'teach',
      label: 'Teach',
      href: '/teach',
      hasDisplayLogic: true,
    },
    {
      key: 'districts',
      label: 'Districts',
      href: '/administrators',
      hasDisplayLogic: true,
    },
    {
      key: 'stats',
      label: 'Stats',
      href: '/promote',
    },
    {
      key: 'donate',
      label: 'Donate',
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
