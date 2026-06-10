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

  it('shows the global nav on the bar when there is no app nav (signed out)', () => {
    render(
      <Header
        {...BASE_PROPS}
        menuItems={[]}
        globalNavItems={[
          {label: 'Districts', href: '//code.org/administrators'},
          {
            label: 'Teach',
            subItems: [{label: 'Educator Overview', href: '//code.org/teach'}],
          },
        ]}
        userAuth={{status: 'signed-out'}}
      />,
    );
    // Hamburger is closed, so these resolve to the top-bar NavMenu. A group links
    // to its overview (the first sub-item's href).
    expect(
      screen.getByRole('link', {name: 'Districts', hidden: true}),
    ).toHaveAttribute('href', '//code.org/administrators');
    expect(
      screen.getByRole('link', {name: 'Teach', hidden: true}),
    ).toHaveAttribute('href', '//code.org/teach');
  });

  it('keeps hamburgerOnly global nav entries off the bar', () => {
    render(
      <Header
        {...BASE_PROPS}
        menuItems={[]}
        globalNavItems={[
          {label: 'Districts', href: '//code.org/administrators'},
          {
            label: 'Privacy & Legal',
            hamburgerOnly: true,
            subItems: [{label: 'Privacy Policy', href: '//code.org/privacy'}],
          },
        ]}
        userAuth={{status: 'signed-out'}}
      />,
    );
    expect(
      screen.getByRole('link', {name: 'Districts', hidden: true}),
    ).toBeInTheDocument();
    // Legal lives in the hamburger (closed here), never on the bar.
    expect(
      screen.queryByRole('link', {name: 'Privacy & Legal', hidden: true}),
    ).not.toBeInTheDocument();
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

  it('omits the Help menu when no support links are provided', () => {
    render(<Header {...BASE_PROPS} userAuth={{status: 'signed-out'}} />);
    expect(
      screen.queryByRole('button', {name: 'Help menu', hidden: true}),
    ).not.toBeInTheDocument();
  });
});
