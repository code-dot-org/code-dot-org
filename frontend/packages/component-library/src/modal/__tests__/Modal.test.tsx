import {render, screen, fireEvent} from '@testing-library/react';
import {vi} from 'vitest';

import Modal, {ModalProps} from './../index';

describe('Modal Component', () => {
  const defaultProps: ModalProps = {
    title: 'Test Modal',
    description: 'This is a test description.',
    primaryButtonProps: {
      children: 'Primary Action',
      onClick: vi.fn(),
    },
    onClose: vi.fn(),
  };

  it('should render the modal with title and description', () => {
    render(<Modal {...defaultProps} />);
    expect(
      screen.getByRole('dialog', {name: 'Test Modal'}),
    ).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
  });

  it('should render the primary and secondary buttons', () => {
    render(
      <Modal
        {...defaultProps}
        secondaryButtonProps={{
          children: 'Secondary Action',
          onClick: vi.fn(),
        }}
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Primary Action'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Secondary Action'}),
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
      />,
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
      />,
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
      'dsco-dialog-description',
    );
    expect(modal).not.toHaveAttribute('aria-labelledby');
  });

  it('should render in place on the MUI dialog shell', () => {
    const {container} = render(<Modal {...defaultProps} />);
    const modal = screen.getByRole('dialog');
    expect(container).toContainElement(modal);
    expect(modal.closest('.MuiDialog-root')).toHaveClass('customDialogOverlay');
    expect(modal).not.toHaveClass('MuiPaper-root');
  });

  it('should aria-hide nothing but the backdrop', () => {
    render(<Modal {...defaultProps} />);
    const hidden = Array.from(
      document.querySelectorAll('[aria-hidden="true"]'),
    );
    expect(hidden.every(el => el.classList.contains('MuiBackdrop-root'))).toBe(
      true,
    );
  });

  it('should put className and other HTML attributes on the panel', () => {
    render(
      <Modal {...defaultProps} className="custom-class" id="custom-modal" />,
    );
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('modal', 'custom-class');
    expect(modal).toHaveAttribute('id', 'custom-modal');
  });

  it('should call onClose when the escape key is pressed', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('button', {name: 'Primary Action'}), {
      key: 'Escape',
      code: 'Escape',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should focus the first button on mount and restore focus on unmount', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const {unmount} = render(<Modal {...defaultProps} />);
    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'Primary Action'}),
    );
    unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });
});
