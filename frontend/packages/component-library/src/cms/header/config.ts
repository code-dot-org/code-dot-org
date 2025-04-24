import {HeaderProps} from './Header';

interface DefaultProps {
  logoImage: string;
  spriteLabImage: string;
  artistImage: string;
  appLabImage: string;
  gameLabImage: string;
  musicLabImage: string;
  dancePartyImage: string;
  pythonLabImage: string;
  allProjectsImage: string;
  studioUrl: string;
}

export function getDefaultHeaderProps({
  logoImage,
  spriteLabImage,
  artistImage,
  appLabImage,
  gameLabImage,
  musicLabImage,
  dancePartyImage,
  pythonLabImage,
  allProjectsImage,
  studioUrl,
}: DefaultProps): HeaderProps {
  return {
    homeLink: {
      href: '/',
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
        key: 'donate',
        label: 'Donate',
        href: '/donate',
        hasDisplayLogic: true,
      },
      {
        key: 'incubator',
        label: 'Incubator',
        href: `${studioUrl}/incubator`,
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
        href: `${studioUrl}/projects/spritelab/new`,
        image: spriteLabImage,
        description: 'Build simple animations',
      },
      {
        key: 'artist',
        label: 'Artist',
        href: `${studioUrl}/projects/artist/new`,
        image: artistImage,
        description: 'Create art with code',
      },
      {
        key: 'appLab',
        label: 'App Lab',
        href: `${studioUrl}/projects/applab/new`,
        image: appLabImage,
        description: 'Make apps with Javascript',
      },
      {
        key: 'gameLab',
        label: 'Game Lab',
        href: `${studioUrl}/projects/gamelab/new`,
        image: gameLabImage,
        description: 'Build simple games',
      },
      {
        key: 'musicLab',
        label: 'Music Lab',
        href: `${studioUrl}/projects/music/new`,
        image: musicLabImage,
        description: 'Create music with code',
      },
      {
        key: 'danceParty',
        label: 'Dance Party',
        href: `${studioUrl}/projects/dance/new`,
        image: dancePartyImage,
        description: 'Make a dance party with AI',
      },
      {
        key: 'pythonLab',
        label: 'Python Lab',
        href: `${studioUrl}/projects/pythonlab/new`,
        image: pythonLabImage,
        description: 'Code using Python',
      },
      {
        key: 'viewAllProjects',
        label: 'View All Projects',
        href: `${studioUrl}/projects`,
        image: allProjectsImage,
      },
    ],
    accountLinks: {
      signIn: {
        label: 'Sign In',
        href: `${studioUrl}/users/sign_in`,
      },
      createAccount: {
        label: 'Create Account',
        href: `${studioUrl}/users/sign_up/account_type`,
      },
      goToDashboard: {
        label: 'Go to Dashboard',
        href: `${studioUrl}/home`,
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
        href: '/donate',
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
}
