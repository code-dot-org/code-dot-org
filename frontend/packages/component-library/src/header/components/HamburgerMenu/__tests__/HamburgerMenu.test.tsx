import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import HamburgerMenu from '../HamburgerMenu';

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

// Donate must be present so the Incubator re-injection has its anchor; Teach
// carries a sub-item to exercise the expandable-section path.
const GLOBAL_NAV = [
  {label: 'Learn', href: '//code.org/students'},
  {
    label: 'Teach',
    subItems: [{label: 'Educator Overview', href: '//code.org/teach'}],
  },
  {label: 'Districts', href: '//code.org/administrators'},
  {label: 'Donate', href: '//code.org/donate'},
];

const SUPPORT_LINKS = [
  {label: 'Help and support', href: 'https://support.code.org'},
  {
    label: 'Report a problem',
    href: 'https://support.code.org/hc/en-us/requests/new',
  },
];

function renderMenu() {
  render(
    <HamburgerMenu
      menuItems={TEACHER_MENU_ITEMS}
      globalNavItems={GLOBAL_NAV}
      supportLinks={SUPPORT_LINKS}
    />,
  );
  return screen.getByRole('button', {name: 'Open navigation menu'});
}

async function openPanel() {
  const user = userEvent.setup();
  const trigger = renderMenu();
  await user.click(trigger);
  await screen.findByText('Districts');
  return {user, trigger};
}

describe('HamburgerMenu', () => {
  it('opens a Popover panel (not a Drawer) on click', async () => {
    await openPanel();
    expect(screen.getByText('Districts')).toBeInTheDocument();
    expect(document.querySelector('.MuiDrawer-root')).toBeNull();
  });

  it('mounts the panel body only while open', async () => {
    const trigger = renderMenu();
    expect(screen.queryByText('Districts')).not.toBeInTheDocument();
    await userEvent.setup().click(trigger);
    expect(await screen.findByText('Districts')).toBeInTheDocument();
  });

  it('renders global-nav sections as native exclusive-accordion disclosures', async () => {
    await openPanel();
    const teach = screen.getByText('Teach').closest('details');
    expect(teach).toBeInTheDocument();
    // Shared name → the browser keeps one section open at a time.
    expect(teach).toHaveAttribute('name', 'hamburger-section');
    expect(screen.getByText('Educator Overview')).toBeInTheDocument();
  });

  it('lists Incubator exactly once', async () => {
    await openPanel();
    expect(screen.getAllByText('Incubator')).toHaveLength(1);
  });

  it('gates app-nav with the mobileOnly class but not global nav', async () => {
    await openPanel();
    expect(screen.getByText('My Dashboard').closest('li')).toHaveClass(
      'mobileOnly',
    );
    expect(screen.getByText('Districts').closest('li')).not.toHaveClass(
      'mobileOnly',
    );
  });

  it('exposes the app-nav/support dividers as width-gated separators', async () => {
    await openPanel();
    const separators = screen.getAllByRole('separator');
    expect(separators).toHaveLength(2);
    separators.forEach(separator =>
      expect(separator).toHaveClass('mobileOnly'),
    );
  });

  it('marks external support links as opening in a new tab', async () => {
    await openPanel();
    const help = screen.getByText('Help and support').closest('a');
    expect(help).toHaveAttribute('target', '_blank');
    expect(help).toHaveAccessibleDescription('Opens in a new tab');
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const {user, trigger} = await openPanel();
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByText('Districts')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });
});
