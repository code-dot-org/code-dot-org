import {render, screen} from '@testing-library/react';

import {Brand} from '@/config/brand';

import MainMenuDesktop, {MenuItemConfig} from '../MainMenuDesktop';

// Mock DropdownMenu
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('../DropdownMenu', () => (props: any) => (
  <div data-testid="dropdown-menu">{props.buttonLabel}</div>
));

// Sample link items
const linkItem = {
  id: 'home',
  label: 'Home',
  href: '/home',
};

const externalLinkItem = {
  id: 'external',
  label: 'External',
  href: 'https://example.com',
};

const dropdownLinkItem = {
  id: 'dropdown',
  label: 'Dropdown',
};

const dropdownConfig = {
  linkList: [
    {id: 'about', label: 'About', href: '/about'},
    {id: 'contact', label: 'Contact', href: '/contact'},
  ],
};

const menuItems: MenuItemConfig[] = [
  {
    type: 'button',
    topLevelLink: linkItem,
  },
  {
    type: 'button',
    topLevelLink: externalLinkItem,
  },
  {
    type: 'dropdown',
    topLevelLink: dropdownLinkItem,
    dropdownConfig,
  },
];

describe('MainMenuDesktop', () => {
  it('renders button menu items', () => {
    render(<MainMenuDesktop mainMenuDesktopItems={[menuItems[0]]} />);
    expect(screen.getByRole('link', {name: /Home/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Home/i})).toHaveAttribute(
      'href',
      '/home',
    );
  });

  it('renders external link with correct target and rel', () => {
    render(<MainMenuDesktop mainMenuDesktopItems={[menuItems[1]]} />);
    const externalLink = screen.getByRole('link', {name: /External/i});
    expect(externalLink).toHaveAttribute('href', 'https://example.com');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders dropdown menu item', () => {
    render(<MainMenuDesktop mainMenuDesktopItems={[menuItems[2]]} />);
    expect(screen.getByTestId('dropdown-menu')).toHaveTextContent('Dropdown');
  });

  it('renders multiple menu items', () => {
    render(<MainMenuDesktop mainMenuDesktopItems={menuItems} />);
    expect(screen.getByRole('link', {name: /Home/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /External/i})).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('returns null for invalid menu item', () => {
    const invalidItem: MenuItemConfig = {
      type: 'button',
      topLevelLink: {id: 'invalid', label: 'Invalid'},
    };
    render(<MainMenuDesktop mainMenuDesktopItems={[invalidItem]} />);
    expect(screen.queryByText('Invalid')).not.toBeInTheDocument();
  });

  it('uses provided brand for external link', () => {
    render(
      <MainMenuDesktop
        mainMenuDesktopItems={[menuItems[1]]}
        brand={Brand.CS_FOR_ALL}
      />,
    );
    const btn = screen.getByRole('link', {name: /External/i});
    expect(btn).toHaveAttribute('target', '_blank');
  });
});
