import {render, screen, fireEvent} from '@testing-library/react';

import DropdownMenu, {MenuListProps} from '../DropdownMenu';

const linkList = [
  {label: 'Home', href: '/home'},
  {label: 'About', href: '/about'},
  {label: 'Contact', href: '/contact'},
  {label: 'External', href: 'https://example.com', external: true},
];

const defaultProps: MenuListProps = {
  id: 'dropdown-menu',
  buttonLabel: 'Menu',
  linkList,
};

describe('DropdownMenu', () => {
  it('renders button with label', () => {
    render(<DropdownMenu {...defaultProps} />);
    expect(screen.getByRole('button', {name: /menu/i})).toBeInTheDocument();
  });

  it('shows ExpandMoreIcon when menu is closed', () => {
    render(<DropdownMenu {...defaultProps} />);
    expect(screen.getByTestId('ExpandMoreIcon')).toBeInTheDocument();
  });

  it('shows ExpandLessIcon when menu is open', () => {
    render(<DropdownMenu {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', {name: /menu/i}));
    expect(screen.getByTestId('ExpandLessIcon')).toBeInTheDocument();
  });

  it('opens menu on button click', () => {
    render(<DropdownMenu {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', {name: /menu/i}));
    expect(screen.getByRole('menu')).toBeVisible();
  });

  it('renders all link items in menu', () => {
    render(<DropdownMenu {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', {name: /menu/i}));
    linkList.forEach(link => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    });
  });

  it('renders external link with correct target and rel', () => {
    render(<DropdownMenu {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', {name: /menu/i}));
    const externalLink = screen.getByRole('menuitem', {name: /external/i});
    expect(externalLink).toHaveAttribute('href', 'https://example.com');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render menu items if linkList is empty', () => {
    render(<DropdownMenu id="empty-menu" buttonLabel="Empty" linkList={[]} />);
    fireEvent.click(screen.getByRole('button', {name: /empty/i}));
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
  });

  it('does not render menu items if linkList is undefined', () => {
    render(<DropdownMenu id="no-list-menu" buttonLabel="NoList" />);
    fireEvent.click(screen.getByRole('button', {name: /nolist/i}));
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
  });

  it('navigates between menu items with arrow keys', () => {
    render(<DropdownMenu {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', {name: /menu/i}));

    const homeItem = screen.getByText('Home');
    const aboutItem = screen.getByText('About');

    homeItem.focus();
    fireEvent.keyDown(homeItem, {key: 'ArrowDown', code: 'ArrowDown'});
    expect(aboutItem).toHaveFocus();

    fireEvent.keyDown(aboutItem, {key: 'ArrowUp', code: 'ArrowUp'});
    expect(homeItem).toHaveFocus();
  });
});
