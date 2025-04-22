import {
  render,
  screen,
  act as testingLibraryAct,
  waitFor as testingLibraryWaitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import Header, {HeaderProps} from '../Header';

function act(callback: () => void) {
  testingLibraryAct(callback);
}

function waitFor(callback: () => void) {
  return testingLibraryWaitFor(callback);
}

describe('Header Component', () => {
  const defaultProps: HeaderProps = {
    homeLink: {
      href: '/',
      ariaLabel: 'Go to homepage',
    },
    logo: {
      src: 'code-logo.svg',
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
        image: 'spriteLabImage.png',
        description: 'Build simple animations',
      },
      {
        key: 'artist',
        label: 'Artist',
        href: 'https://studio.code.org/projects/artist/new',
        image: 'artistImage.png',
        description: 'Create art with code',
      },
      {
        key: 'appLab',
        label: 'App Lab',
        href: 'https://studio.code.org/projects/applab/new',
        image: 'appLabImage.png',
        description: 'Make apps with Javascript',
      },
      {
        key: 'gameLab',
        label: 'Game Lab',
        href: 'https://studio.code.org/projects/gamelab/new',
        image: 'gameLabImage.png',
        description: 'Build simple games',
      },
      {
        key: 'musicLab',
        label: 'Music Lab',
        href: '/music',
        image: 'musicLabImage.png',
        description: 'Create music with code',
      },
      {
        key: 'danceParty',
        label: 'Dance Party',
        href: 'https://studio.code.org/projects/dance/new',
        image: 'dancePartyImage.png',
        description: 'Make a dance party with AI',
      },
      {
        key: 'pythonLab',
        label: 'Python Lab',
        href: 'https://studio.code.org/projects/pythonlab/new',
        image: 'pythonLabImage.png',
        description: 'Code using Python',
      },
      {
        key: 'viewAllProjects',
        label: 'View All Projects',
        href: 'https://studio.code.org/projects',
        image: 'viewAllProjectsImage.png',
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

  it('renders the header with the correct logo and home link', () => {
    render(<Header {...defaultProps} />);

    // check that logo is rendered
    const logo = screen.getByAltText('Code.org logo');
    expect(logo).toBeInTheDocument();

    // check that logo links to the homepage
    const homeLink = screen.getByLabelText('Go to homepage');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders main links', () => {
    render(<Header {...defaultProps} />);

    defaultProps.mainLinks.forEach(link => {
      const mainLink = screen.getByText(link.label);

      // check that each main link is rendered
      expect(mainLink).toBeInTheDocument();
      expect(mainLink).toHaveAttribute('href', link.href);
    });
  });

  it('renders the projects menu with the correct links', () => {
    render(<Header {...defaultProps} />);

    // check that the New Project button is rendered
    const newProjectButton = screen.getByText('New Project');
    expect(newProjectButton).toBeInTheDocument();

    // click to open the Projects menu
    act(() => {
      newProjectButton.click();
    });

    // wait for the Projects menu to be visible
    waitFor(() => {
      defaultProps.projectsLinks.forEach(link => {
        const projectLink = screen.getByText(link.label);

        // check that each project link is rendered
        expect(projectLink).toBeInTheDocument();
        expect(projectLink).toHaveAttribute('href', link.href);
      });
    });
  });

  it('renders the account buttons correctly when user is not logged in', () => {
    render(<Header {...defaultProps} />);

    // check that Sign In button is rendered
    const signInButton = screen.getByText('Sign In');
    expect(signInButton).toBeInTheDocument();

    // check that Create Account button is rendered
    const createAccountButton = screen.getByText('Create Account');
    expect(createAccountButton).toBeInTheDocument();

    // check that Go to Dashboard button is not rendered
    const dashboardButton = screen.queryByText('Go to Dashboard');
    expect(dashboardButton).not.toBeInTheDocument();
  });

  it('renders the account buttons correctly when user is logged in', () => {
    render(<Header {...defaultProps} isLoggedIn={true} />);

    // check that Sign In button is not rendered
    const signInButton = screen.queryByText('Sign In');
    expect(signInButton).not.toBeInTheDocument();

    // check that Create Account button is not rendered
    const createAccountButton = screen.queryByText('Create Account');
    expect(createAccountButton).not.toBeInTheDocument();

    // check that Go to Dashboard button is rendered
    const dashboardButton = screen.getByText('Go to Dashboard');
    expect(dashboardButton).toBeInTheDocument();
  });

  it('renders the help menu with the correct links', () => {
    render(<Header {...defaultProps} />);

    // check that the Help button is rendered
    const helpButton = screen.getByLabelText('Open Help menu');
    expect(helpButton).toBeInTheDocument();

    // click to open the Help menu
    act(() => {
      helpButton.click();
    });

    // wait for the Help menu to be visible
    waitFor(() => {
      defaultProps.helpLinks.forEach(link => {
        const helpLink = screen.getByText(link.label);

        // check that each help link is rendered
        expect(helpLink).toBeInTheDocument();
        expect(helpLink).toHaveAttribute('href', link.href);
      });
    });
  });

  it('renders the hamburger menu with the correct links', () => {
    render(<Header {...defaultProps} />);

    // check that the Hamburger button is rendered
    const hamburgerButton = screen.getByLabelText('Open Hamburger menu');
    expect(hamburgerButton).toBeInTheDocument();

    // click to open the Help menu
    act(() => {
      hamburgerButton.click();
    });

    // wait for the Help menu to be visible
    waitFor(() => {
      defaultProps.hamburgerLinks.forEach(link => {
        const hamburgerLink = screen.getByText(link.label);

        // check that each help link is rendered
        expect(hamburgerLink).toBeInTheDocument();
        expect(hamburgerLink).toHaveAttribute('href', link.href);
      });
    });
  });
});
