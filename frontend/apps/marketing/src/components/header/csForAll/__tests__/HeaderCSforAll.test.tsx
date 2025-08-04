import {render, screen, fireEvent} from '@testing-library/react';

import '@testing-library/jest-dom';
import HeaderCSforAll from '../HeaderCSforAll';

describe('HeaderCSforAll', () => {
  it('renders the site logo', () => {
    render(<HeaderCSforAll />);
    const logo = screen.getByRole('link', {name: 'Go to homepage'});
    expect(logo).toBeInTheDocument();
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
