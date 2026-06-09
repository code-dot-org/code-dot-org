import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import Header from '../Header';

const BASE_PROPS = {
  logoImageUrl: '/logo.png',
  brandName: 'Code.org',
  menuItems: [{label: 'Learn', href: '/students'}],
};

describe('Header', () => {
  it('renders brand and menu items when signed out', () => {
    render(<Header {...BASE_PROPS} userAuth={{status: 'signed-out'}} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
  });

  it('renders Skeleton for error state', () => {
    const {container} = render(
      <Header {...BASE_PROPS} userAuth={{status: 'error'}} />,
    );
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('renders display_name for signed-in state', () => {
    render(
      <Header
        {...BASE_PROPS}
        userAuth={{
          status: 'signed-in',
          display_name: 'Alice',
          user_type: 'student',
        }}
      />,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders Sign In and Create Account links when signed-out', () => {
    render(<Header {...BASE_PROPS} userAuth={{status: 'signed-out'}} />);
    // hidden: true — the auth area is mobile-first display:none and its
    // min-width media query doesn't apply under jsdom, so the links are in the
    // DOM but not "visible" to getByRole's default accessibility filter.
    expect(
      screen.getByRole('link', {name: 'Sign in', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'Create account', hidden: true}),
    ).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('renders brand and menu items in every auth state', () => {
    const states = [
      {
        status: 'signed-in' as const,
        display_name: 'Alice',
        user_type: 'student' as const,
      },
      {status: 'signed-out' as const},
      {status: 'error' as const},
    ];
    for (const userAuth of states) {
      const {unmount} = render(<Header {...BASE_PROPS} userAuth={userAuth} />);
      expect(screen.getByText('Learn')).toBeInTheDocument();
      unmount();
    }
  });
});
