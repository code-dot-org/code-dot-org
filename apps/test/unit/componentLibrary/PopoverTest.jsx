import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Popover from '@cdo/apps/componentLibrary/popover'; // Adjust the import path accordingly

describe('Design System - Popover Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders with correct title and content', () => {
    render(
      <Popover
        title="Test Popover"
        content="This is the content of the popover."
        onClose={mockOnClose}
      />
    );

    const title = screen.getByText('Test Popover');
    const content = screen.getByText('This is the content of the popover.');
    const closeButton = screen.getByRole('button', {name: 'Close'});

    expect(title).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Popover
        title="Test Popover"
        content="This is the content of the popover."
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', {name: 'Close'});
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with an icon when provided', () => {
    render(
      <Popover
        title="Test Popover"
        content="This is the content of the popover."
        onClose={mockOnClose}
        icon={{iconName: 'check', iconStyle: 'solid', title: 'check-icon'}}
      />
    );

    const icon = screen.getByTitle('check-icon');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('fa-solid', 'fa-check');
  });

  it('renders with an image when provided', () => {
    render(
      <Popover
        title="Test Popover"
        content="This is the content of the popover."
        onClose={mockOnClose}
        image={{src: 'test-image.png', alt: 'Test Image'}}
      />
    );

    const image = screen.getByRole('img', {name: 'Test Image'});

    expect(image).toBeInTheDocument();
  });

  it('renders with custom buttons when provided', () => {
    render(
      <Popover
        title="Test Popover"
        content="This is the content of the popover."
        onClose={mockOnClose}
        buttons={<button type="button">Custom Button</button>}
      />
    );

    const customButton = screen.getByText('Custom Button');
    expect(customButton).toBeInTheDocument();
  });
});
