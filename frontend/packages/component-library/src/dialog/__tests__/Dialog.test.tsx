import {render, screen, fireEvent} from '@testing-library/react';

import '@testing-library/jest-dom';

import Dialog, {DialogProps} from './../index';

describe('Dialog Component', () => {
  const defaultProps: DialogProps = {
    title: 'Test Dialog',
    description: 'This is a test description.',
    onClose: jest.fn(),
    closeLabel: 'Close the dialog',
    primaryButtonProps: {text: 'Primary Button', onClick: jest.fn()},
    secondaryButtonProps: {text: 'Secondary Button', onClick: jest.fn()},
    mode: 'light',
  };

  it('should render the dialog with title and description', () => {
    render(<Dialog {...defaultProps} />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
  });

  it('should render the primary and secondary buttons', () => {
    render(<Dialog {...defaultProps} />);

    expect(
      screen.getByRole('button', {name: 'Primary Button'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Secondary Button'}),
    ).toBeInTheDocument();
  });

  it('should trigger onClose when the close button is clicked', () => {
    render(<Dialog {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Close the dialog'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not render the secondary button if secondaryButtonProps is not provided', () => {
    render(<Dialog {...defaultProps} secondaryButtonProps={undefined} />);

    expect(
      screen.queryByRole('button', {name: 'Secondary Button'}),
    ).not.toBeInTheDocument();
  });

  it('should render an icon if the icon prop is provided', () => {
    render(
      <Dialog
        {...defaultProps}
        icon={{iconName: 'check-circle', title: 'Icon'}}
      />,
    );

    expect(screen.getByTitle('Icon')).toBeInTheDocument();
  });

  it('should render an image if imageUrl is provided', () => {
    const imageUrl = 'https://via.placeholder.com/150';
    render(<Dialog {...defaultProps} imageUrl={imageUrl} />);

    expect(screen.getByRole('img', {name: 'Dialog'})).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', imageUrl);
  });

  it('should lock body scroll when rendered', () => {
    render(<Dialog {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should allow custom content to be rendered', () => {
    render(<Dialog {...defaultProps} customContent={<p>Custom Content</p>} />);

    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('should render custom bottom content', () => {
    render(
      <Dialog
        {...defaultProps}
        customBottomContent={<p>Custom Bottom Content</p>}
      />,
    );

    expect(screen.getByText('Custom Bottom Content')).toBeInTheDocument();
  });

  // Test for escape key handler
  it('should call onClose when the escape key is pressed', () => {
    render(<Dialog {...defaultProps} />);
    fireEvent.keyDown(document, {key: 'Escape', code: 'Escape'});
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });
});
