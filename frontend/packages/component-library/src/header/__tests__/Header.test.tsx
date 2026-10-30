import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders Sign in and Create account links when signed-out', () => {
    render(<Header {...BASE_PROPS} userAuth={{status: 'signed-out'}} />);
    // The auth pills are authored default-visible (hidden only below mobileAuth
    // via a max-width media query, which jsdom ignores), so they resolve without
    // the hidden filter.
    expect(screen.getByRole('link', {name: 'Sign in'})).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'Create account'}),
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

  it('skips a global nav entry that resolves to no href', () => {
    render(
      <Header
        {...BASE_PROPS}
        menuItems={[]}
        globalNavItems={[
          {label: 'Districts', href: '//code.org/administrators'},
          // A group with no sub-items yields no overview href.
          {label: 'Empty', subItems: []},
        ]}
        userAuth={{status: 'signed-out'}}
      />,
    );
    expect(
      screen.getByRole('link', {name: 'Districts', hidden: true}),
    ).toBeInTheDocument();
    // No '#' placeholder link — the entry is dropped, not rendered broken.
    expect(
      screen.queryByRole('link', {name: 'Empty', hidden: true}),
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

  describe('marketingNav (signed-out marketing item set)', () => {
    const MARKETING_ITEMS = [
      {label: 'Teachers', href: '//code.org/teachers'},
      {label: 'Districts', href: '//code.org/districts'},
      {label: 'About', href: '//code.org/about', alignEnd: true as const},
      {label: 'Donate', href: '//code.org/donate', alignEnd: true as const},
    ];

    it('carries alignEnd through the flattened bar nav and marks the nav list', () => {
      const {container} = render(
        <Header
          {...BASE_PROPS}
          menuItems={[]}
          globalNavItems={MARKETING_ITEMS}
          userAuth={{status: 'signed-out'}}
          marketingNav
        />,
      );
      expect(container.querySelector('.marketing-nav')).toBeInTheDocument();
      const about = screen.getByRole('link', {name: 'About', hidden: true});
      // The first alignEnd item carries the auto-margin class; Donate (the
      // second) doesn't need it — both fold via the same alignEnd class.
      expect(about.closest('li')).toHaveClass('navItemAlignEndFirst');
      const donate = screen.getByRole('link', {name: 'Donate', hidden: true});
      expect(donate.closest('li')).not.toHaveClass('navItemAlignEndFirst');
      expect(donate.closest('li')).toHaveClass('navItemAlignEnd');
    });

    it('omits the flex spacer so the nav list can grow to the edge', () => {
      const {container} = render(
        <Header
          {...BASE_PROPS}
          menuItems={[]}
          globalNavItems={MARKETING_ITEMS}
          userAuth={{status: 'signed-out'}}
          marketingNav
        />,
      );
      expect(container.querySelector('.spacer')).not.toBeInTheDocument();
    });

    it('reaches alignEnd items via the hamburger (always-shown global nav)', async () => {
      const user = userEvent.setup();
      render(
        <Header
          {...BASE_PROPS}
          menuItems={[]}
          globalNavItems={MARKETING_ITEMS}
          userAuth={{status: 'signed-out'}}
          marketingNav
        />,
      );
      await user.click(
        screen.getByRole('button', {name: 'Open navigation menu'}),
      );
      // The panel portals to document.body; scope to it since Donate is also
      // on the (closed-hamburger) top bar via the same globalNavItems entry.
      const panel = await waitFor(() => {
        const p = document.querySelector('.MuiPopover-paper');
        expect(p).not.toBeNull();
        return p as HTMLElement;
      });
      expect(
        within(panel).getByRole('link', {name: 'Donate'}),
      ).toBeInTheDocument();
    });

    it('does not add the marketing-nav class or drop the spacer by default', () => {
      const {container} = render(
        <Header {...BASE_PROPS} userAuth={{status: 'signed-out'}} />,
      );
      expect(container.querySelector('.marketing-nav')).not.toBeInTheDocument();
      expect(container.querySelector('.spacer')).toBeInTheDocument();
    });
  });
});
