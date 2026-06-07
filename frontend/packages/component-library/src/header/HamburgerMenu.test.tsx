import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Header from './Header';

// Teacher menu items include Incubator in the app-nav list; the hamburger
// re-injects it once into the global-nav region (regression: it used to
// appear twice).
const TEACHER_MENU_ITEMS = [
  {label: 'My Dashboard', href: '/home'},
  {label: 'Course Catalog', href: '/catalog'},
  {label: 'Projects', href: '/projects'},
  {label: 'Professional Learning', href: '/my-professional-learning'},
  {label: 'Incubator', href: '//code.org/incubator'},
];

const PROPS = {
  logoImageUrl: '/logo.png',
  brandName: 'CodeAI',
  menuItems: TEACHER_MENU_ITEMS,
  userAuth: {
    status: 'signed-in' as const,
    display_name: 'Ms. Rivera',
    user_type: 'teacher' as const,
  },
};

async function openHamburger() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', {name: 'Open navigation menu'}));
  return document.getElementById('hamburger-dropdown') as HTMLElement;
}

describe('HamburgerMenu', () => {
  it('renders as a dropdown panel, not an MUI Drawer', async () => {
    render(<Header {...PROPS} />);
    const panel = await openHamburger();
    expect(within(panel).getByText('Districts')).toBeInTheDocument();
    expect(document.querySelector('.MuiDrawer-root')).toBeNull();
  });

  it('mounts the panel body only while open', async () => {
    render(<Header {...PROPS} />);
    // "Districts" is hamburger-only global nav; absent until the panel opens.
    expect(screen.queryByText('Districts')).not.toBeInTheDocument();
    await openHamburger();
    expect(screen.getByText('Districts')).toBeInTheDocument();
  });

  it('expands a section in place, keeping the panel open', async () => {
    const user = userEvent.setup();
    render(<Header {...PROPS} />);
    const panel = await openHamburger();

    expect(
      within(panel).queryByText('Educator Overview'),
    ).not.toBeInTheDocument();

    await user.click(within(panel).getByRole('button', {name: 'Teach'}));
    expect(within(panel).getByText('Educator Overview')).toBeInTheDocument();
    // Panel stays open (toggling a section doesn't close the dropdown): a
    // sibling row is still present.
    expect(within(panel).getByText('Districts')).toBeInTheDocument();
  });

  it('lists Incubator exactly once', async () => {
    render(<Header {...PROPS} />);
    const panel = await openHamburger();
    expect(within(panel).getAllByText('Incubator')).toHaveLength(1);
  });

  it('gates app-nav items with the mobileOnly class but not global nav', async () => {
    render(<Header {...PROPS} />);
    const panel = await openHamburger();
    expect(within(panel).getByText('My Dashboard').closest('li')).toHaveClass(
      'mobileOnly',
    );
    expect(within(panel).getByText('Districts').closest('li')).not.toHaveClass(
      'mobileOnly',
    );
  });
});
