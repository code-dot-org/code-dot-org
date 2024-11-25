import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';

import Modal, {ModalProps} from '@cdo/apps/componentLibrary/modal';

describe('Modal Component', () => {
  const defaultProps: ModalProps = {
    title: 'Test Modal',
    description: 'This is a test description.',
    primaryButtonProps: {
      text: 'Primary Action',
      onClick: jest.fn(),
    },
    onClose: jest.fn(),
  };

  it('should render the modal with title and description', () => {
    render(<Modal {...defaultProps} />);
    expect(
      screen.getByRole('dialog', {name: 'Test Modal'})
    ).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
  });

  it('should render the primary and secondary buttons', () => {
    render(
      <Modal
        {...defaultProps}
        secondaryButtonProps={{text: 'Secondary Action', onClick: jest.fn()}}
      />
    );
    expect(
      screen.getByRole('button', {name: 'Primary Action'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Secondary Action'})
    ).toBeInTheDocument();
  });

  it('should trigger onClose when the close button is clicked', () => {
    render(<Modal {...defaultProps} />);
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should render an image and validate placement', () => {
    render(
      <Modal
        {...defaultProps}
        imageUrl="https://via.placeholder.com/150"
        imageAlt="Custom Modal Image"
        imagePlacement="inline"
      />
    );
    const image = screen.getByAltText('Custom Modal Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/150');
  });

  it('should render custom content', () => {
    render(<Modal {...defaultProps} customContent={<p>Custom Content</p>} />);
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('should render custom bottom content', () => {
    render(
      <Modal
        {...defaultProps}
        customBottomContent={<div>Custom Bottom Content</div>}
      />
    );
    expect(screen.getByText('Custom Bottom Content')).toBeInTheDocument();
  });

  it('should apply accessibility attributes', () => {
    render(<Modal {...defaultProps} />);
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-label', 'Test Modal');
    expect(modal).toHaveAttribute(
      'aria-describedby',
      'dsco-dialog-description'
    );
  });
});
