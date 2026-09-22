import {ThemeProvider} from '@mui/material';
import {render, screen, fireEvent} from '@testing-library/react';
import {vi} from 'vitest';

import CdoTheme from '@/themes/code.org';

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

  const renderModal = (props: Partial<ModalProps> = {}) =>
    render(
      <ThemeProvider theme={CdoTheme}>
        <Modal {...defaultProps} {...props} />
      </ThemeProvider>,
    );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal with title and description', () => {
    renderModal();
    expect(
      screen.getByRole('dialog', {name: 'Test Modal'}),
    ).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
  });

  it('should render the primary and secondary buttons', () => {
    renderModal({
      secondaryButtonProps: {
        children: 'Secondary Action',
        onClick: vi.fn(),
      },
    });
    expect(
      screen.getByRole('button', {name: 'Primary Action'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Secondary Action'}),
    ).toBeInTheDocument();
  });

  it('should trigger onClose when the close button is clicked', () => {
    renderModal();
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should trigger onClose on Escape', () => {
    renderModal();
    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
    });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should render an image and validate placement', () => {
    renderModal({
      imageUrl: 'https://via.placeholder.com/150',
      imageAlt: 'Custom Modal Image',
      imagePlacement: 'inline',
    });
    const image = screen.getByAltText('Custom Modal Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/150');
  });

  it('should render custom content', () => {
    renderModal({customContent: <p>Custom Content</p>});
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('should render custom bottom content', () => {
    renderModal({customBottomContent: <div>Custom Bottom Content</div>});
    expect(screen.getByText('Custom Bottom Content')).toBeInTheDocument();
  });

  it('should apply accessibility attributes', () => {
    renderModal();
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-label', 'Test Modal');
    expect(modal).toHaveAttribute(
      'aria-describedby',
      'dsco-dialog-description',
    );
  });

  it('should put className on the dialog panel', () => {
    renderModal({className: 'custom-class'});
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('custom-class');
    expect(modal).toHaveClass('MuiDialog-paper');
  });
});
