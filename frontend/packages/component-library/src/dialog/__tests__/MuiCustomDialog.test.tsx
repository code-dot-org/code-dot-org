/**
 * Every test renders the MUI-backed wrapper under CdoTheme; the `MuiDialog`
 * entry in styleOverrides/dialog.ts paints the surface these tests check.
 */
import {ThemeProvider} from '@mui/material';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';

import {ThemeProvider as DscoThemeProvider, useTheme} from '@/common/contexts';
import CdoTheme from '@/themes/code.org';

import {CustomDialog, MuiCustomDialog, MuiCustomDialogProps} from './../index';

describe('Design System - MuiCustomDialog', () => {
  const defaultProps: MuiCustomDialogProps = {
    'aria-label': 'Test Custom Dialog',
    onClose: vi.fn(),
    children: (
      <p id="dsco-dialog-description">This is a test dialog content.</p>
    ),
  };

  const renderDialog = (props: Partial<MuiCustomDialogProps> = {}) =>
    render(
      <ThemeProvider theme={CdoTheme}>
        <MuiCustomDialog {...defaultProps} {...props} />
      </ThemeProvider>,
    );

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a named dialog with its children', () => {
    renderDialog();

    expect(
      screen.getByRole('dialog', {name: 'Test Custom Dialog'}),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is a test dialog content.'),
    ).toBeInTheDocument();
  });

  it('points aria-describedby at the description id by default', () => {
    renderDialog();

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-describedby',
      'dsco-dialog-description',
    );
  });

  it('does not emit an aria-labelledby that points nowhere', () => {
    renderDialog();

    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
  });

  it('calls onClose from the close button', () => {
    const onClose = vi.fn();
    renderDialog({onClose});

    fireEvent.click(screen.getByRole('button', {name: 'Close dialog'}));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('labels the close button with closeLabel', () => {
    renderDialog({closeLabel: 'Close'});

    expect(screen.getByRole('button', {name: 'Close'})).toBeInTheDocument();
  });

  it('renders no close button without onClose', () => {
    renderDialog({onClose: undefined});

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onClose on Escape', () => {
    const onClose = vi.fn();
    renderDialog({onClose});

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape without onClose', () => {
    renderDialog({onClose: undefined});

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not close on a backdrop click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({onClose});

    await user.click(document.querySelector('.MuiBackdrop-root') as Element);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll while mounted', () => {
    const {unmount} = renderDialog();
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('shares the scroll lock with a legacy dialog closed out of order', () => {
    const legacy = render(
      <CustomDialog aria-label="Legacy" onClose={vi.fn()}>
        <p id="dsco-dialog-description">Legacy</p>
      </CustomDialog>,
    );
    const mui = renderDialog();
    expect(document.body.style.overflow).toBe('hidden');

    legacy.unmount();
    expect(document.body.style.overflow).toBe('hidden');

    mui.unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('moves focus to the first control inside the dialog', async () => {
    renderDialog({
      children: (
        <>
          <p id="dsco-dialog-description">Description</p>
          <button type="button">First control</button>
        </>
      ),
    });

    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'First control'})).toHaveFocus(),
    );
  });

  it('puts className and HTML attributes on the dialog panel', () => {
    renderDialog({
      className: 'custom-class',
      role: 'alertdialog',
      id: 'the-dialog',
      'data-testid': 'panel',
    } as Partial<MuiCustomDialogProps>);

    const panel = screen.getByRole('alertdialog');
    expect(panel).toHaveClass('custom-class');
    expect(panel).toHaveClass('MuiDialog-paper');
    expect(panel).toHaveAttribute('id', 'the-dialog');
    expect(panel).toHaveAttribute('data-testid', 'panel');
  });

  it('forwards data-theme to the panel, since it portals out of the tree', () => {
    renderDialog({'data-theme': 'Dark'});

    expect(screen.getByRole('dialog')).toHaveAttribute('data-theme', 'Dark');
  });

  it('carries no data-theme outside a DSCO ThemeProvider', () => {
    renderDialog();

    expect(screen.getByRole('dialog')).not.toHaveAttribute('data-theme');
  });

  it('follows the theme of an enclosing DSCO ThemeProvider', () => {
    const ThemeToggle = () => {
      const {toggleTheme} = useTheme();
      return (
        <button type="button" onClick={toggleTheme}>
          Toggle theme
        </button>
      );
    };
    render(
      <ThemeProvider theme={CdoTheme}>
        <DscoThemeProvider>
          <MuiCustomDialog {...defaultProps}>
            <p id="dsco-dialog-description">Description</p>
            <ThemeToggle />
          </MuiCustomDialog>
        </DscoThemeProvider>
      </ThemeProvider>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('data-theme', 'Light');
    fireEvent.click(screen.getByRole('button', {name: 'Toggle theme'}));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-theme', 'Dark');
  });

  it('warns when no element carries the description id', () => {
    renderDialog({children: <div />});

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Warning: CustomDialog component and it's derivatives (Dialog, Modal components) should have an element with" +
          " id='dsco-dialog-description' to provide a description of dialog for screen readers.",
      ),
    );
  });

  it('warns when the dialog has no accessible name', () => {
    renderDialog({'aria-label': undefined});

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'should have an aria-label or aria-labelledby attribute.',
      ),
    );
  });

  describe('theme surface (styleOverrides/dialog.ts)', () => {
    it('paints a flat neutral panel with a hairline border', () => {
      renderDialog();
      const s = getComputedStyle(screen.getByRole('dialog'));

      expect(s.backgroundColor).toBe('var(--background-neutral-primary)');
      expect(s.borderWidth).toBe('1px');
      expect(s.borderStyle).toBe('solid');
      // jsdom's color parser drops `var()` border colors, so read the rule.
      expect(document.head.textContent).toContain(
        'border-color:var(--borders-neutral-primary)',
      );
      expect(s.borderRadius).toBe('0');
      expect(s.boxShadow).toBe('none');
    });

    it('sits at the design system modal tier on a near-black backdrop', () => {
      renderDialog();
      const root = document.querySelector('.MuiDialog-root') as HTMLElement;
      const backdrop = document.querySelector(
        '.MuiBackdrop-root',
      ) as HTMLElement;

      expect(getComputedStyle(root).zIndex).toBe('1040');
      expect(getComputedStyle(backdrop).backgroundColor).toBe(
        'var(--neutral-black-alpha-90)',
      );
    });

    it('takes zIndex over the theme tier', () => {
      renderDialog({zIndex: 2000});
      const root = document.querySelector('.MuiDialog-root') as HTMLElement;

      expect(getComputedStyle(root).zIndex).toBe('2000');
    });
  });
});
