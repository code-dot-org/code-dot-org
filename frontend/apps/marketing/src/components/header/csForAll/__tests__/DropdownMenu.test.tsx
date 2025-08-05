import {render, screen, fireEvent} from '@testing-library/react';

import DropdownMenu, {MenuListProps} from '../DropdownMenu';

const linkList = [
  {label: 'Home', href: '/home'},
  {label: 'About', href: '/about'},
  {label: 'Contact', href: '/contact'},
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

  it('calls handleClose when menu item is clicked', () => {
    render(<DropdownMenu {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', {name: /menu/i}));
    fireEvent.click(screen.getByText('Home'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
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
});
