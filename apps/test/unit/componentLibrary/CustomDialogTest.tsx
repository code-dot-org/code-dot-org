import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import {
  CustomDialog,
  CustomDialogProps,
} from '@cdo/apps/componentLibrary/dialog';

describe('CustomDialog Component', () => {
  const defaultProps: CustomDialogProps = {
    'aria-label': 'Test Custom Dialog',
    onClose: jest.fn(),
    children: (
      <p id="dsco-dialog-description">This is a test dialog content.</p>
    ),
  };

  it('should render the CustomDialog with the provided title and children', () => {
    render(<CustomDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test dialog content.')
    ).toBeInTheDocument();
  });

  it('should call the onClose handler when the close button is clicked', () => {
    render(<CustomDialog {...defaultProps} />);

    const closeButton = screen.getByLabelText('Close dialog');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not render the close button if onClose is not provided', () => {
    render(<CustomDialog {...defaultProps} onClose={undefined} />);

    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('should warn if the description element with id="dsco-dialog-description" is not provided', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    render(
      <CustomDialog {...defaultProps}>
        <div />
      </CustomDialog>
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Warning: CustomDialog component and it's derivatives (Dialog, Modal components) should have an element with" +
          " id='dsco-dialog-description' to provide a description of dialog for screen readers."
      )
    );
    consoleWarnSpy.mockRestore();
  });

  it('should lock body scroll when rendered', () => {
    render(<CustomDialog {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should call the onClose handler when the escape key is pressed', () => {
    render(<CustomDialog {...defaultProps} />);
    fireEvent.keyDown(document, {key: 'Escape', code: 'Escape'});

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should render additional HTML attributes passed via the props', () => {
    render(<CustomDialog {...defaultProps} role="alertdialog" />);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
  });

  // TODO: [Design2-182] Create a visual test to check these two cases
  // it('should apply the correct class for the mode prop', () => {
  //   render(<CustomDialog {...defaultProps} mode="dark" />);
  //
  //   const dialog = screen.getByRole('dialog');
  //   expect(dialog).toHaveClass('dialog-dark');
  // });
  //
  // it('should render custom classes passed via the className prop', () => {
  //   render(<CustomDialog {...defaultProps} className="custom-class" />);
  //
  //   const dialog = screen.getByRole('dialog');
  //   expect(dialog).toHaveClass('custom-class');
  // });
});
