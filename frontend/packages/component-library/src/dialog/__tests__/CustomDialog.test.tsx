import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useEffect, useRef, useState} from 'react';
import {vi} from 'vitest';

import {CustomDialog, CustomDialogProps} from './../index';

const description = (
  <p id="dsco-dialog-description">This is a test dialog content.</p>
);

const getPanel = () => screen.getByRole('dialog');
const getRoot = () => getPanel().closest('.MuiDialog-root') as HTMLElement;
const getFocusContainer = (panel: HTMLElement) =>
  panel.closest('.MuiDialog-container') as HTMLElement;
// The transition's onEntered, and the first-control focus with it, fires on a zero timeout.
const settle = () =>
  act(() => new Promise<void>(resolve => setTimeout(resolve, 10)));

describe('CustomDialog Component', () => {
  const defaultProps: CustomDialogProps = {
    'aria-label': 'Test Custom Dialog',
    onClose: vi.fn(),
    children: description,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('should render the dialog with the provided children', () => {
    render(<CustomDialog {...defaultProps} />);

    expect(getPanel()).toBeInTheDocument();
    expect(
      screen.getByText('This is a test dialog content.'),
    ).toBeInTheDocument();
  });

  it('should call the onClose handler when the close button is clicked', () => {
    render(<CustomDialog {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Close dialog'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should use closeLabel as the close button aria-label', () => {
    render(<CustomDialog {...defaultProps} closeLabel="Dismiss" />);

    expect(screen.getByRole('button', {name: 'Dismiss'})).toBeInTheDocument();
  });

  it('should not render the close button if onClose is not provided', () => {
    render(<CustomDialog {...defaultProps} onClose={undefined} />);

    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('should render the close button after the children', () => {
    render(<CustomDialog {...defaultProps} />);

    expect(getPanel().lastElementChild).toBe(
      screen.getByLabelText('Close dialog'),
    );
    expect(getPanel().firstElementChild).toHaveAttribute(
      'id',
      'dsco-dialog-description',
    );
  });

  it('should color the close button from mode', () => {
    const {unmount} = render(<CustomDialog {...defaultProps} />);
    expect(screen.getByLabelText('Close dialog')).toHaveClass(
      'closeButton-dark',
    );
    unmount();

    render(<CustomDialog {...defaultProps} mode="dark" />);
    expect(screen.getByLabelText('Close dialog')).toHaveClass(
      'closeButton-light',
    );
  });

  it('should warn if the description element with id="dsco-dialog-description" is not provided', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(
      <CustomDialog {...defaultProps}>
        <div />
      </CustomDialog>,
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Warning: CustomDialog component and it's derivatives (Dialog, Modal components) should have an element with" +
          " id='dsco-dialog-description' to provide a description of dialog for screen readers.",
      ),
    );
    consoleWarnSpy.mockRestore();
  });

  it('should warn if neither aria-label nor aria-labelledby is provided', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<CustomDialog>{description}</CustomDialog>);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('should have an aria-label or aria-labelledby'),
    );
    consoleWarnSpy.mockRestore();
  });

  it('should not warn when it is labelled and described', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<CustomDialog {...defaultProps} />);

    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  it('should lock body scroll when rendered', () => {
    render(<CustomDialog {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('');
  });

  it('should call the onClose handler when the escape key is pressed', () => {
    render(<CustomDialog {...defaultProps} />);
    fireEvent.keyDown(document, {key: 'Escape', code: 'Escape'});

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should let an Escape pressed inside the dialog reach the document listener', () => {
    render(<CustomDialog {...defaultProps} />);
    fireEvent.keyDown(screen.getByLabelText('Close dialog'), {
      key: 'Escape',
      code: 'Escape',
    });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close on a backdrop click', () => {
    render(<CustomDialog {...defaultProps} />);
    const container = getRoot().querySelector(
      '.MuiDialog-container',
    ) as HTMLElement;
    fireEvent.mouseDown(container);
    fireEvent.click(container);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should render additional HTML attributes passed via the props', () => {
    render(<CustomDialog {...defaultProps} role="alertdialog" />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('should put className, id, style, title, data-theme and handlers on the panel', () => {
    const onClick = vi.fn();
    render(
      <CustomDialog
        {...defaultProps}
        className="consumerClass"
        id="consumerId"
        style={{width: 123}}
        title="Native title"
        data-theme="Dark"
        onClick={onClick}
      />,
    );
    const panel = getPanel();

    expect(panel).toHaveClass('customDialog', 'consumerClass');
    expect(panel).toHaveAttribute('id', 'consumerId');
    expect(panel.style.width).toBe('123px');
    expect(panel).toHaveAttribute('title', 'Native title');
    expect(panel).toHaveAttribute('data-theme', 'Dark');
    fireEvent.click(panel);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render the panel as a plain div without Paper styles or props', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    render(<CustomDialog {...defaultProps} />);
    const panel = getPanel();

    expect(panel.tagName).toBe('DIV');
    expect(panel.className).not.toMatch(/(^|\s)css-/);
    expect(panel).not.toHaveClass('MuiPaper-root');
    for (const attr of ['ownerstate', 'elevation', 'as']) {
      expect(panel).not.toHaveAttribute(attr);
    }
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should label and describe the panel as the legacy dialog does', () => {
    render(<CustomDialog {...defaultProps} />);
    const panel = getPanel();

    expect(panel).toHaveAttribute('aria-label', 'Test Custom Dialog');
    expect(panel).toHaveAttribute('aria-modal', 'true');
    expect(panel).toHaveAttribute(
      'aria-describedby',
      'dsco-dialog-description',
    );
    expect(panel).not.toHaveAttribute('aria-labelledby');
  });

  it('should pass aria-labelledby and aria-describedby through', () => {
    render(
      <CustomDialog
        aria-labelledby="heading"
        aria-describedby="custom-description"
      >
        <h2 id="heading">Heading</h2>
        <p id="dsco-dialog-description">Description</p>
      </CustomDialog>,
    );
    const panel = screen.getByRole('dialog', {name: 'Heading'});

    expect(panel).toHaveAttribute('aria-labelledby', 'heading');
    expect(panel).not.toHaveAttribute('aria-label');
    expect(panel).toHaveAttribute('aria-describedby', 'custom-description');
  });

  it('should render in place, inside the render container', () => {
    const {container} = render(<CustomDialog {...defaultProps} />);

    expect(container.contains(getPanel())).toBe(true);
    expect(container.contains(getRoot())).toBe(true);
  });

  it('should keep the legacy overlay marker and z-index on the MUI root', () => {
    render(<CustomDialog {...defaultProps} />);
    const root = getRoot();

    expect(root).toHaveClass('customDialogOverlay');
    expect(root.matches('.customDialogOverlay.MuiDialog-root')).toBe(true);
    expect(
      root
        .querySelector(':scope > .MuiBackdrop-root')
        ?.matches('.customDialogOverlay > .MuiBackdrop-root'),
    ).toBe(true);
    expect(
      getComputedStyle(root).getPropertyValue('--cdo-dialog-z-index'),
    ).toBe('');
  });

  it('should set --cdo-dialog-z-index on the root from zIndex', () => {
    render(<CustomDialog {...defaultProps} zIndex={5000} />);

    expect(
      getComputedStyle(getRoot()).getPropertyValue('--cdo-dialog-z-index'),
    ).toBe('5000');
    expect(getRoot().style.zIndex).toBe('');
  });

  it('should honor a zIndex of 0', () => {
    render(<CustomDialog {...defaultProps} zIndex={0} />);

    expect(
      getComputedStyle(getRoot()).getPropertyValue('--cdo-dialog-z-index'),
    ).toBe('0');
  });

  it('should aria-hide nothing but the backdrop', () => {
    render(
      <>
        <CustomDialog {...defaultProps} />
        <CustomDialog aria-label="Second">{description}</CustomDialog>
      </>,
    );
    const hidden = Array.from(
      document.querySelectorAll('[aria-hidden="true"]'),
    );

    expect(hidden).toHaveLength(2);
    hidden.forEach(element => {
      expect(element).toHaveClass('MuiBackdrop-root');
    });
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
  });

  it('should focus the first focusable element once entered and restore focus on unmount', async () => {
    const Host = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Opener
          </button>
          {isOpen && (
            <CustomDialog
              aria-label="Focus test"
              onClose={() => setIsOpen(false)}
            >
              <p id="dsco-dialog-description">Description</p>
              <button type="button">First</button>
            </CustomDialog>
          )}
        </>
      );
    };
    render(<Host />);
    const opener = screen.getByRole('button', {name: 'Opener'});
    opener.focus();
    fireEvent.click(opener);

    expect(document.activeElement).toBe(getFocusContainer(getPanel()));
    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'First'})).toHaveFocus(),
    );

    fireEvent.click(screen.getByLabelText('Close dialog'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
  });

  it('should skip disabled controls when choosing the first focusable element', async () => {
    render(
      <CustomDialog {...defaultProps}>
        <p id="dsco-dialog-description">Description</p>
        <button type="button" disabled>
          Disabled
        </button>
        <button type="button">Enabled</button>
      </CustomDialog>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Enabled'})).toHaveFocus(),
    );
  });

  it('should pass over a match that cannot take focus, such as a hidden input', async () => {
    render(
      <CustomDialog {...defaultProps}>
        <p id="dsco-dialog-description">Description</p>
        <input type="hidden" name="token" value="t" />
        <button type="button">Visible</button>
      </CustomDialog>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Visible'})).toHaveFocus(),
    );
  });

  it('should keep focus that a mount effect moved into the panel', async () => {
    const Host = () => {
      const inputRef = useRef<HTMLInputElement>(null);
      useEffect(() => inputRef.current?.focus(), []);
      return (
        <CustomDialog {...defaultProps}>
          <p id="dsco-dialog-description">Description</p>
          <button type="button">First</button>
          <input aria-label="Target" ref={inputRef} />
        </CustomDialog>
      );
    };
    render(<Host />);
    await settle();

    expect(screen.getByRole('textbox', {name: 'Target'})).toHaveFocus();
  });

  it('should focus the MUI container when the panel has nothing focusable', async () => {
    render(
      <CustomDialog aria-label="Nothing to focus">{description}</CustomDialog>,
    );
    await settle();

    expect(document.activeElement).toBe(getFocusContainer(getPanel()));
    expect(document.activeElement).toHaveAttribute('tabindex', '-1');
  });

  it('should pull focus back into the dialog when it moves outside', async () => {
    render(
      <>
        <button type="button">Outside</button>
        <CustomDialog {...defaultProps}>
          <p id="dsco-dialog-description">Description</p>
          <button type="button">First</button>
        </CustomDialog>
      </>,
    );
    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'First'})).toHaveFocus(),
    );

    screen.getByRole('button', {name: 'Outside'}).focus();

    expect(screen.getByRole('button', {name: 'Outside'})).not.toHaveFocus();
    expect(document.activeElement).toBe(getFocusContainer(getPanel()));
  });

  it('should wrap Tab and Shift+Tab inside the panel', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <CustomDialog {...defaultProps}>
          <p id="dsco-dialog-description">Description</p>
          <button type="button">First</button>
        </CustomDialog>
        <button type="button">After</button>
      </>,
    );
    const first = screen.getByRole('button', {name: 'First'});
    const last = screen.getByLabelText('Close dialog');
    await waitFor(() => expect(first).toHaveFocus());

    await user.tab();
    expect(last).toHaveFocus();

    await user.tab();
    expect(first).toHaveFocus();

    await user.tab({shift: true});
    expect(last).toHaveFocus();
  });

  describe('with two dialogs open', () => {
    const Host = ({first, second}: {first: boolean; second: boolean}) => (
      <>
        {first && (
          <CustomDialog aria-label="First">
            <p id="dsco-dialog-description">First</p>
          </CustomDialog>
        )}
        {second && (
          <CustomDialog aria-label="Second">
            <p id="dsco-dialog-description">Second</p>
          </CustomDialog>
        )}
      </>
    );

    it.each([
      ['first', {first: false, second: true}],
      ['second', {first: true, second: false}],
    ])(
      'should restore body scroll only after the last dialog closes (%s closes first)',
      (_order, afterFirstClose) => {
        document.body.style.overflow = 'auto';
        const {rerender} = render(<Host first second />);
        expect(document.body.style.overflow).toBe('hidden');

        rerender(<Host {...afterFirstClose} />);
        expect(document.body.style.overflow).toBe('hidden');

        rerender(<Host first={false} second={false} />);
        expect(document.body.style.overflow).toBe('auto');
        expect(document.body.style.paddingRight).toBe('');
      },
    );

    it.each([
      ['first', {first: false, second: true}, {first: true, second: false}],
      ['second', {first: true, second: false}, {first: false, second: true}],
    ])(
      'should hold the lock while a later dialog is open after the %s one to open closes',
      (_earlier, onlyLater, onlyEarlier) => {
        document.body.style.overflow = 'auto';
        const {rerender} = render(<Host {...onlyEarlier} />);
        rerender(<Host first second />);

        rerender(<Host {...onlyLater} />);
        expect(document.body.style.overflow).toBe('hidden');

        rerender(<Host first={false} second={false} />);
        expect(document.body.style.overflow).toBe('auto');
      },
    );

    it('should trap focus in the dialog opened last', async () => {
      render(
        <>
          <CustomDialog aria-label="First">
            <p id="dsco-dialog-description">First</p>
            <button type="button">In first</button>
          </CustomDialog>
          <CustomDialog aria-label="Second">
            <p id="dsco-dialog-description">Second</p>
            <button type="button">In second</button>
          </CustomDialog>
        </>,
      );
      await waitFor(() =>
        expect(screen.getByRole('button', {name: 'In second'})).toHaveFocus(),
      );

      screen.getByRole('button', {name: 'In first'}).focus();

      expect(document.activeElement).toBe(
        getFocusContainer(screen.getByRole('dialog', {name: 'Second'})),
      );
    });

    it('should call both onClose handlers on Escape', () => {
      const onFirstClose = vi.fn();
      const onSecondClose = vi.fn();
      render(
        <>
          <CustomDialog aria-label="First" onClose={onFirstClose}>
            <p id="dsco-dialog-description">First</p>
          </CustomDialog>
          <CustomDialog aria-label="Second" onClose={onSecondClose}>
            <p id="dsco-dialog-description">Second</p>
          </CustomDialog>
        </>,
      );
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'Second'}), {
        key: 'Escape',
        code: 'Escape',
      });

      expect(onFirstClose).toHaveBeenCalledTimes(1);
      expect(onSecondClose).toHaveBeenCalledTimes(1);
    });
  });
});
