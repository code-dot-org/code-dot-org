import {render, screen, fireEvent} from '@testing-library/react';

import '@testing-library/jest-dom';
import HeaderCSforAll from '../HeaderCSforAll';

describe('HeaderCSforAll', () => {
  it('renders the site logo', () => {
    render(<HeaderCSforAll />);
    const logo = screen.getByRole('link', {name: 'Go to homepage'});
    expect(logo).toBeInTheDocument();
  });

  it('renders the main navigation on desktop', () => {
    render(<HeaderCSforAll />);
    const nav = screen.getByLabelText('Main navigation');
    expect(nav).toBeInTheDocument();
  });

  it('renders a dropdown menu', () => {
    render(<HeaderCSforAll />);
    const dropdownToggle = screen.getAllByRole('button')[0];
    fireEvent.click(dropdownToggle);
    const dropdownMenu = screen.getByRole('menu');
    expect(dropdownMenu).toBeInTheDocument();
  });

  it('renders the main navigation on mobile', () => {
    render(<HeaderCSforAll />);
    const nav = screen.getByLabelText('Main mobile navigation');
    expect(nav).toBeInTheDocument();
  });

  it('renders call to action button on desktop and drawer', () => {
    render(<HeaderCSforAll />);
    const callToAction = screen.getAllByText('Get Involved');
    expect(callToAction).toHaveLength(2);
  });

  it('opens and closes the drawer when hamburger is clicked', () => {
    render(<HeaderCSforAll />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    fireEvent.click(hamburgerButton);
    // Drawer should be open, look for CloseButton
    const closeButton = screen.getByLabelText('Close menu');
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);
  });
});
