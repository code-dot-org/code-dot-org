import {render, screen, fireEvent} from '@testing-library/react';

import AFEContinueNotice from '../AFEContinueNotice';

const logEvent = jest.fn();
jest.mock('@statsig/react-bindings', () => {
  const actual = jest.requireActual('@statsig/react-bindings');
  return {
    ...actual,
    useStatsigClient: () => ({
      logEvent,
    }),
  };
});

const studioUrl = 'https://studio.code.org';
jest.mock('@/config/studio', () => ({
  getStudioUrl: (path: string) => `${studioUrl}${path}`,
}));

describe('AFEContinueNotice', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    logEvent.mockClear();
    mockOnClose.mockClear();

    Object.defineProperty(window, 'location', {
      value: {
        assign: jest.fn(),
      },
    });
  });

  const renderComponent = () =>
    render(<AFEContinueNotice onClose={mockOnClose} />);

  it('renders the main header and message', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {name: 'Almost done!'}),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Thank you for completing your application/i),
    ).toBeInTheDocument();
  });

  it('calls logEvent and navigates on sign in click', () => {
    renderComponent();

    const signInLink = screen.getByRole('link', {name: 'Sign in'});

    expect(signInLink).toBeInTheDocument();
    fireEvent.click(signInLink);
    expect(logEvent).toHaveBeenCalledWith('AFE Sign In Button Press');
    expect(window.location.href).toContain(`${studioUrl}/users/sign_in`);
  });

  it('calls logEvent and navigates on sign up click', () => {
    renderComponent();

    const signUpButton = screen.getByRole('button', {name: 'Sign up'});

    expect(signUpButton).toBeInTheDocument();
    fireEvent.click(signUpButton);
    expect(logEvent).toHaveBeenCalledWith('AFE Sign Up Button Press');
    expect(window.location.href).toContain(`${studioUrl}/users/sign_up`);
  });
});
