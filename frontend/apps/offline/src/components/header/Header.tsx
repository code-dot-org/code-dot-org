'use client';

import React, {PropsWithChildren} from 'react';

import DSCOHeader from '@code-dot-org/component-library/cms/header';

import moduleStyles from './header.module.scss';

export interface HeaderProps extends PropsWithChildren {
  /** Whether we are inside a level. */
  inLevel: boolean;
}

const Header: React.FunctionComponent<HeaderProps> = ({inLevel, children}) => {
  return (
    <DSCOHeader
      studioBaseUrl=""
      className={moduleStyles.header}
      navLabel={{
        main: 'Main navigation',
        secondary: 'Secondary navigation',
      }}
      homeLink="/"
      logo={{
        src: '/images/logo-inverse.svg',
        altText: 'Code.org',
      }}
      projectsLinks={
        !inLevel && [
          {
            key: 'spriteLab',
            label: 'Sprite Lab',
            href: 'https://studio.code.org/projects/spritelab/new',
            image: '/images/header/header-sprite-lab-icon.png',
            description: 'Build simple animations',
          },
          {
            key: 'artist',
            label: 'Artist',
            href: 'https://studio.code.org/projects/artist/new',
            image: '/images/header/header-artist-icon.png',
            description: 'Create art with code',
          },
          {
            key: 'appLab',
            label: 'App Lab',
            href: 'https://studio.code.org/projects/applab/new',
            image: '/images/header/header-app-lab-icon.png',
            description: 'Make apps with Javascript',
          },
          {
            key: 'gameLab',
            label: 'Game Lab',
            href: 'https://studio.code.org/projects/gamelab/new',
            image: '/images/header/header-game-lab-icon.png',
            description: 'Build simple games',
          },
          {
            key: 'musicLab',
            label: 'Music Lab',
            href: '/music',
            image: '/images/header/header-music-lab-icon.png',
            description: 'Create music with code',
          },
          {
            key: 'danceParty',
            label: 'Dance Party',
            href: 'https://studio.code.org/projects/dance/new',
            image: '/images/header/header-dance-party-icon.png',
            description: 'Make a dance party with AI',
          },
          {
            key: 'pythonLab',
            label: 'Python Lab',
            href: 'https://studio.code.org/projects/pythonlab/new',
            image: '/images/header/header-python-lab-icon.png',
            description: 'Code using Python',
          },
          {
            key: 'viewAllProjects',
            label: 'View All Projects',
            href: 'https://studio.code.org/projects',
            image: '/images/header/header-all-projects-icon.png',
          },
        ]
      }
      accountLinks={{
        signIn: {
          label: 'Sign in',
          href: '/sessions/new',
        },
        createAccount: {
          label: 'Create account',
          href: '/users/new',
        },
      }}
      projectsButtonLabel="New project"
      projectsButtonAriaLabel={{
        open: 'Open projects menu',
        close: 'Close projects menu',
        menu: 'Projects menu',
      }}
      helpButtonLabel={{
        open: 'Open help menu',
        close: 'Close help menu',
        menu: 'Help menu',
      }}
      hamburgerButtonLabel={{
        open: 'Open hamburger menu',
        close: 'Close hamburger menu',
        menu: 'Hamburger menu',
      }}
    >
      {children}
    </DSCOHeader>
  );
};

export default Header;
