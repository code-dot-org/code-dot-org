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

  it('renders correctly when user status is loading', async () => {
    const mockFetch = jest.fn(() => new Promise(() => {}));
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Header {...defaultProps} />);

    // check that the Loading button is rendered
    // and no other account buttons are rendered
    await waitFor(() => {
      const loadingButton = screen.getByText('Loading');
      expect(loadingButton).toBeInTheDocument();

      const signInButton = screen.queryByText('Sign In');
      expect(signInButton).not.toBeInTheDocument();

      const createAccountButton = screen.queryByText('Create Account');
      expect(createAccountButton).not.toBeInTheDocument();

      const dashboardButton = screen.queryByText('Go to Dashboard');
      expect(dashboardButton).not.toBeInTheDocument();
    });

    jest.restoreAllMocks();
  });

  it('renders correctly when user status is signed out', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({is_signed_in: false}),
    });
    global.fetch = mockFetch;

    render(<Header {...defaultProps} />);

    // check that the Sign In and Create Account buttons are rendered
    // and no other account buttons are rendered
    await waitFor(() => {
      const loadingButton = screen.queryByText('Loading');
      expect(loadingButton).not.toBeInTheDocument();

      const signInButton = screen.getByText('Sign In');
      expect(signInButton).toBeInTheDocument();

      const createAccountButton = screen.getByText('Create Account');
      expect(createAccountButton).toBeInTheDocument();

      const dashboardButton = screen.queryByText('Go to Dashboard');
      expect(dashboardButton).not.toBeInTheDocument();
    });

    jest.restoreAllMocks();
  });

  it('renders correctly when user status is signed in', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({is_signed_in: true}),
    });
    global.fetch = mockFetch;

    render(<Header {...defaultProps} />);

    // check that the Go to Dashboard button is rendered
    // and no other account buttons are rendered
    await waitFor(() => {
      const loadingButton = screen.queryByText('Loading');
      expect(loadingButton).not.toBeInTheDocument();

      const signInButton = screen.queryByText('Sign In');
      expect(signInButton).not.toBeInTheDocument();

      const createAccountButton = screen.queryByText('Create Account');
      expect(createAccountButton).not.toBeInTheDocument();

      const dashboardButton = screen.getByText('Go to Dashboard');
      expect(dashboardButton).toBeInTheDocument();
    });

    jest.restoreAllMocks();
  });

  it('renders correctly when there is an error fetching user status', async () => {
    const mockFetch = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'));
    global.fetch = mockFetch;

    render(<Header {...defaultProps} />);

    // check that the Sign In and Create account buttons are rendered
    // and no other account buttons are rendered
    await waitFor(() => {
      const loadingButton = screen.queryByText('Loading');
      expect(loadingButton).not.toBeInTheDocument();

      const signInButton = screen.getByText('Sign In');
      expect(signInButton).toBeInTheDocument();

      const createAccountButton = screen.getByText('Create Account');
      expect(createAccountButton).toBeInTheDocument();

      const dashboardButton = screen.queryByText('Go to Dashboard');
      expect(dashboardButton).not.toBeInTheDocument();
    });

    jest.restoreAllMocks();
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
