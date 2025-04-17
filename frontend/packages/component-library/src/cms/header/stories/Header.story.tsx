import logoImage from '@public/images/cdo-logo-inverse.svg';
import allProjectsImage from '@public/images/header-all-projects-icon.png';
import appLabImage from '@public/images/header-app-lab-icon.png';
import artistImage from '@public/images/header-artist-icon.png';
import dancePartyImage from '@public/images/header-dance-party-icon.png';
import gameLabImage from '@public/images/header-game-lab-icon.png';
import musicLabImage from '@public/images/header-music-lab-icon.png';
import pythonLabImage from '@public/images/header-python-lab-icon.png';
import spriteLabImage from '@public/images/header-sprite-lab-icon.png';
import {INITIAL_VIEWPORTS} from '@storybook/addon-viewport';
import type {Meta, StoryObj} from '@storybook/react';

import Header, {HeaderProps} from '../Header';

type Story = StoryObj<typeof Header>;

export default {
  title: 'CMS/Header',
  component: Header,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Disable the color contrast rule for the Header.
            // Header component has one a11y issue, and it's related to the background and link colors.
            // This is a known issue across our design system, and we are ok accepting this for now.
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
  },
  render: args => <Header {...args} />,
} as Meta<HeaderProps>;

const defaultArgs: HeaderProps = {
  homeLink: {
    href: 'https://code.org',
    ariaLabel: 'Go to homepage',
  },
  logo: {
    src: logoImage,
    altText: 'Code.org logo',
  },
  navLabel: {
    main: 'Main navigation',
    secondary: 'Secondary navigation',
  },
  mainLinksLabel: 'Main site links',
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
  projectsButtonAriaLabel: {
    open: 'Open Projects menu',
    close: 'Close Projects menu',
    menu: 'Projects menu',
  },
  projectsLinks: [
    {
      key: 'spriteLab',
      label: 'Sprite Lab',
      href: 'https://studio.code.org/projects/spritelab/new',
      image: spriteLabImage,
      description: 'Build simple animations',
    },
    {
      key: 'artist',
      label: 'Artist',
      href: 'https://studio.code.org/projects/artist/new',
      image: artistImage,
      description: 'Create art with code',
    },
    {
      key: 'appLab',
      label: 'App Lab',
      href: 'https://studio.code.org/projects/applab/new',
      image: appLabImage,
      description: 'Make apps with Javascript',
    },
    {
      key: 'gameLab',
      label: 'Game Lab',
      href: 'https://studio.code.org/projects/gamelab/new',
      image: gameLabImage,
      description: 'Build simple games',
    },
    {
      key: 'musicLab',
      label: 'Music Lab',
      href: 'https://studio.code.org/projects/dance/new',
      image: musicLabImage,
      description: 'Create music with code',
    },
    {
      key: 'danceParty',
      label: 'Dance Party',
      href: 'https://code.org/music',
      image: dancePartyImage,
      description: 'Make a dance party with AI',
    },
    {
      key: 'pythonLab',
      label: 'Python Lab',
      href: 'https://studio.code.org/projects/pythonlab/new',
      image: pythonLabImage,
      description: 'Code using Python',
    },
    {
      key: 'viewAllProjects',
      label: 'View All Projects',
      href: 'https://studio.code.org/projects',
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
  isLoggedIn: false,
  helpButtonLabel: {
    open: 'Open Help menu',
    close: 'Close Help menu',
    menu: 'Help menu',
  },
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
  hamburgerButtonLabel: {
    open: 'Open Hamburger menu',
    close: 'Close Hamburger menu',
    menu: 'Hamburger menu',
  },
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
export const LoggedOut: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: 'desktop',
  },
};

export const LoggedIn: Story = {
  args: {
    ...defaultArgs,
    isLoggedIn: true,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: 'desktop',
  },
};

export const SmallDesktop: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: 'ipad12p',
    },
  },
};

export const Tablet: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const Mobile: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
