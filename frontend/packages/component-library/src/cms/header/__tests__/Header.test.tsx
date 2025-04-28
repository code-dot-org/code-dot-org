import {
  render,
  screen,
  act as testingLibraryAct,
  waitFor as testingLibraryWaitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import {getDefaultHeaderProps} from '../config';
import Header from '../Header';

function act(callback: () => void) {
  testingLibraryAct(callback);
}

function waitFor(callback: () => void) {
  return testingLibraryWaitFor(callback);
}

describe('Header Component', () => {
  const defaultProps = getDefaultHeaderProps({
    logoImage: 'logo.png',
    spriteLabImage: 'spriteLab.png',
    artistImage: 'artist.png',
    appLabImage: 'appLab.png',
    gameLabImage: 'gameLab.png',
    musicLabImage: 'musicLab.png',
    dancePartyImage: 'danceParty.png',
    pythonLabImage: 'pythonLab.png',
    allProjectsImage: 'allProjects.png',
    studioUrl: 'https://studio.code.org',
  });

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
