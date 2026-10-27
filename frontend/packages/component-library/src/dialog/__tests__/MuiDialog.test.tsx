import {render, screen, fireEvent, within} from '@testing-library/react';
import {vi} from 'vitest';

import {MuiDialog, MuiDialogProps} from './../index';

const getPanel = () => screen.getByRole('alertdialog');

describe('MuiDialog Component', () => {
  const defaultProps: MuiDialogProps = {
    title: 'Test Dialog',
    description: 'This is a test description.',
    onClose: vi.fn(),
    closeLabel: 'Close the dialog',
    primaryButtonProps: {children: 'Primary Button', onClick: vi.fn()},
    secondaryButtonProps: {children: 'Secondary Button', onClick: vi.fn()},
    mode: 'light',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('should render the dialog with title and description', () => {
    render(<MuiDialog {...defaultProps} />);

    expect(getPanel()).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {level: 2, name: 'Test Dialog'}),
    ).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toHaveAttribute(
      'id',
      'dsco-dialog-description',
    );
  });

  it('should name the panel with the title', () => {
    render(<MuiDialog {...defaultProps} />);

    expect(getPanel()).toHaveAttribute('aria-label', 'Test Dialog');
    expect(getPanel()).toHaveAttribute(
      'aria-describedby',
      'dsco-dialog-description',
    );
    expect(getPanel()).not.toHaveAttribute('aria-labelledby');
  });

  it('should render the primary and secondary buttons', () => {
    render(<MuiDialog {...defaultProps} />);

    expect(
      screen.getByRole('button', {name: 'Primary Button'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Secondary Button'}),
    ).toBeInTheDocument();
  });

  it('should render the secondary button before the primary one', () => {
    render(<MuiDialog {...defaultProps} />);
    const [secondary, primary] = within(
      getPanel().querySelector('.dialogActionsSection') as HTMLElement,
    ).getAllByRole('button');

    expect(secondary).toHaveTextContent('Secondary Button');
    expect(primary).toHaveTextContent('Primary Button');
  });

  it('should color the buttons from mode', () => {
    const {unmount} = render(<MuiDialog {...defaultProps} />);
    expect(screen.getByRole('button', {name: 'Primary Button'})).toHaveClass(
      'MuiButton-contained',
      'MuiButton-colorPrimary',
    );
    expect(screen.getByRole('button', {name: 'Secondary Button'})).toHaveClass(
      'MuiButton-outlined',
      'MuiButton-colorSecondary',
    );
    unmount();

    render(<MuiDialog {...defaultProps} mode="dark" />);
    expect(screen.getByRole('button', {name: 'Primary Button'})).toHaveClass(
      'MuiButton-contained',
      'MuiButton-colorWhite',
    );
    expect(screen.getByRole('button', {name: 'Secondary Button'})).toHaveClass(
      'MuiButton-outlined',
      'MuiButton-colorWhite',
    );
  });

  it('should let button props override the mode color', () => {
    render(
      <MuiDialog
        {...defaultProps}
        primaryButtonProps={{children: 'Delete', color: 'error'}}
      />,
    );

    expect(screen.getByRole('button', {name: 'Delete'})).toHaveClass(
      'MuiButton-colorError',
    );
  });

  it('should leave the close button and panel alone in dark mode', () => {
    render(<MuiDialog {...defaultProps} mode="dark" />);

    expect(screen.getByLabelText('Close the dialog')).toHaveClass(
      'closeButton-dark',
    );
    expect(getPanel().className).not.toMatch(/dark/);
  });

  it('should trigger onClose when the close button is clicked', () => {
    render(<MuiDialog {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Close the dialog'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not render the close button without onClose', () => {
    render(<MuiDialog {...defaultProps} onClose={undefined} />);

    expect(screen.queryByLabelText('Close the dialog')).not.toBeInTheDocument();
  });

  it('should not render the secondary button if secondaryButtonProps is not provided', () => {
    render(<MuiDialog {...defaultProps} secondaryButtonProps={undefined} />);

    expect(
      screen.queryByRole('button', {name: 'Secondary Button'}),
    ).not.toBeInTheDocument();
  });

  it('should render an icon badge as a direct child of the panel', () => {
    render(
      <MuiDialog
        {...defaultProps}
        icon={{iconName: 'check-circle', title: 'Icon'}}
      />,
    );
    const icon = screen.getByTitle('Icon');

    expect(icon).toHaveClass('fa-check-circle', 'dialogIcon');
    expect(icon.parentElement).toBe(getPanel());
    expect(icon.matches('.dialog > .dialogIcon')).toBe(true);
  });

  it('should render an image above the title, decorative by default', () => {
    const imageUrl = 'https://via.placeholder.com/150';
    render(<MuiDialog {...defaultProps} imageUrl={imageUrl} />);
    const image = getPanel().querySelector('img') as HTMLImageElement;

    expect(image).toHaveAttribute('src', imageUrl);
    expect(image).toHaveAttribute('alt', '');
    expect(image.matches('.dialogTextSection img')).toBe(true);
    expect(image.nextElementSibling?.tagName).toBe('H2');
  });

  it('should use imageAlt as the image alt text', () => {
    render(
      <MuiDialog
        {...defaultProps}
        imageUrl="https://via.placeholder.com/150"
        imageAlt="Students coding"
      />,
    );

    expect(
      screen.getByRole('img', {name: 'Students coding'}),
    ).toBeInTheDocument();
  });

  it('should lock body scroll when rendered', () => {
    render(<MuiDialog {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should render custom content after the description', () => {
    render(
      <MuiDialog {...defaultProps} customContent={<p>Custom Content</p>} />,
    );
    const custom = screen.getByText('Custom Content');

    expect(custom.parentElement).toHaveClass('dialogTextSection');
    expect(custom.previousElementSibling).toHaveAttribute(
      'id',
      'dsco-dialog-description',
    );
  });

  it('should render custom bottom content after the actions row', () => {
    render(
      <MuiDialog
        {...defaultProps}
        customBottomContent={<p>Custom Bottom Content</p>}
      />,
    );
    const bottom = screen.getByText('Custom Bottom Content');

    expect(bottom.parentElement).toBe(getPanel());
    expect(bottom.previousElementSibling).toHaveClass('dialogActionsSection');
  });

  it('should put className and other attributes on the panel', () => {
    render(
      <MuiDialog
        {...defaultProps}
        className="consumerClass"
        id="consumerId"
        data-theme="Dark"
      />,
    );

    expect(getPanel()).toHaveClass('customDialog', 'dialog', 'consumerClass');
    expect(getPanel()).toHaveAttribute('id', 'consumerId');
    expect(getPanel()).toHaveAttribute('data-theme', 'Dark');
  });

  it('should pass zIndex to the overlay', () => {
    render(<MuiDialog {...defaultProps} zIndex={2000} />);
    const root = getPanel().closest('.MuiDialog-root') as HTMLElement;

    expect(
      getComputedStyle(root).getPropertyValue('--cdo-dialog-z-index'),
    ).toBe('2000');
  });

  it('should not warn when a description is given', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<MuiDialog {...defaultProps} />);

    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  it('should call onClose when the escape key is pressed', () => {
    render(<MuiDialog {...defaultProps} />);
    fireEvent.keyDown(document, {key: 'Escape', code: 'Escape'});

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
