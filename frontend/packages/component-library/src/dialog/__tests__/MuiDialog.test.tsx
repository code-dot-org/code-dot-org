import {ThemeProvider} from '@mui/material';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import CdoTheme from '@/themes/code.org';

import {MuiDialog, MuiDialogProps} from './../index';

describe('Design System - MuiDialog', () => {
  const defaultProps: MuiDialogProps = {
    title: 'Test Dialog',
    description: 'This is a test description.',
    onClose: vi.fn(),
    closeLabel: 'Close the dialog',
    primaryButtonProps: {children: 'Primary Button', onClick: vi.fn()},
    secondaryButtonProps: {children: 'Secondary Button', onClick: vi.fn()},
    mode: 'light',
  };

  const renderDialog = (props: Partial<MuiDialogProps> = {}) =>
    render(
      <ThemeProvider theme={CdoTheme}>
        <MuiDialog {...defaultProps} {...props} />
      </ThemeProvider>,
    );

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an alertdialog named by its h2 title, with the description', () => {
    renderDialog();

    const dialog = screen.getByRole('alertdialog', {name: 'Test Dialog'});
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {level: 2, name: 'Test Dialog'}),
    ).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toHaveAttribute(
      'id',
      'dsco-dialog-description',
    );
    expect(dialog).toHaveAttribute(
      'aria-describedby',
      'dsco-dialog-description',
    );
  });

  it('lets a consumer aria-label name the dialog instead of the title', () => {
    renderDialog({'aria-label': 'Custom name'});

    const dialog = screen.getByRole('alertdialog', {name: 'Custom name'});
    expect(dialog).not.toHaveAttribute('aria-labelledby');
  });

  it('does not point aria-labelledby at an empty title, and warns', () => {
    renderDialog({title: undefined});

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).not.toHaveAttribute('aria-labelledby');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('aria-label or aria-labelledby'),
    );
  });

  it('renders the primary and secondary buttons, secondary first', () => {
    renderDialog();

    const buttons = screen.getAllByRole('button');
    expect(buttons.map(b => b.textContent)).toEqual([
      'Secondary Button',
      'Primary Button',
      '',
    ]);
    expect(buttons[2]).toHaveAccessibleName('Close the dialog');
  });

  it('spreads button props onto MUI buttons', () => {
    renderDialog();

    fireEvent.click(screen.getByRole('button', {name: 'Primary Button'}));
    fireEvent.click(screen.getByRole('button', {name: 'Secondary Button'}));

    expect(defaultProps.primaryButtonProps.onClick).toHaveBeenCalledTimes(1);
    expect(defaultProps.secondaryButtonProps?.onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', {name: 'Primary Button'})).toHaveClass(
      'MuiButton-contained',
    );
    expect(screen.getByRole('button', {name: 'Secondary Button'})).toHaveClass(
      'MuiButton-outlined',
    );
  });

  it('maps mode dark to white buttons', () => {
    renderDialog({mode: 'dark'});

    expect(screen.getByRole('button', {name: 'Primary Button'})).toHaveClass(
      'MuiButton-containedWhite',
    );
    expect(screen.getByRole('button', {name: 'Secondary Button'})).toHaveClass(
      'MuiButton-outlinedWhite',
    );
  });

  it('triggers onClose from the close button', () => {
    const onClose = vi.fn();
    renderDialog({onClose});

    fireEvent.click(screen.getByLabelText('Close the dialog'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders no close button and ignores Escape without onClose', () => {
    renderDialog({onClose: undefined});

    expect(screen.queryByLabelText('Close the dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('alertdialog'), {
      key: 'Escape',
      code: 'Escape',
    });
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('does not render the secondary button if secondaryButtonProps is not provided', () => {
    renderDialog({secondaryButtonProps: undefined});

    expect(
      screen.queryByRole('button', {name: 'Secondary Button'}),
    ).not.toBeInTheDocument();
  });

  it('renders an icon if the icon prop is provided', () => {
    renderDialog({icon: {iconName: 'check-circle', title: 'Icon'}});

    const icon = screen.getByTitle('Icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('fa-check-circle');
  });

  it('renders an image if imageUrl is provided', () => {
    const imageUrl = 'https://via.placeholder.com/150';
    renderDialog({imageUrl});

    expect(screen.getByRole('img', {name: 'Dialog'})).toHaveAttribute(
      'src',
      imageUrl,
    );
  });

  it('uses imageAlt for the image, including an empty decorative alt', () => {
    const imageUrl = 'https://via.placeholder.com/150';
    const {rerender} = renderDialog({imageUrl, imageAlt: 'A robot waving'});
    expect(screen.getByRole('img', {name: 'A robot waving'})).toBeVisible();

    rerender(
      <ThemeProvider theme={CdoTheme}>
        <MuiDialog {...defaultProps} imageUrl={imageUrl} imageAlt="" />
      </ThemeProvider>,
    );
    expect(screen.queryByRole('img')).toBeNull();
    expect(document.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('locks body scroll when rendered', () => {
    renderDialog();

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('renders custom content after the description', () => {
    renderDialog({customContent: <p>Custom Content</p>});

    const custom = screen.getByText('Custom Content');
    expect(custom).toBeInTheDocument();
    expect(
      screen
        .getByText('This is a test description.')
        .compareDocumentPosition(custom) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('renders custom content without a description', () => {
    renderDialog({
      description: undefined,
      customContent: <p id="dsco-dialog-description">Only custom</p>,
    });

    expect(screen.getByText('Only custom')).toBeInTheDocument();
  });

  it('renders custom bottom content after the actions', () => {
    renderDialog({customBottomContent: <p>Custom Bottom Content</p>});

    const bottom = screen.getByText('Custom Bottom Content');
    expect(
      screen
        .getByRole('button', {name: 'Primary Button'})
        .compareDocumentPosition(bottom) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('calls onClose when the escape key is pressed', () => {
    const onClose = vi.fn();
    renderDialog({onClose});

    fireEvent.keyDown(screen.getByRole('alertdialog'), {
      key: 'Escape',
      code: 'Escape',
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focuses the first action button on open', async () => {
    renderDialog();

    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: 'Secondary Button'}),
      ).toHaveFocus(),
    );
  });

  it('puts className on the dialog panel', () => {
    renderDialog({className: 'wide'});

    expect(screen.getByRole('alertdialog')).toHaveClass('wide');
    expect(screen.getByRole('alertdialog')).toHaveClass('MuiDialog-paper');
  });
});
