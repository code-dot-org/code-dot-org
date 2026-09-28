import {fireEvent, render, screen} from '@testing-library/react';
import {useState} from 'react';
import {vi} from 'vitest';

import {CustomDialog, MuiCustomDialog, MuiCustomDialogProps} from './../index';

const description = (
  <p id="dsco-dialog-description">This is a test dialog content.</p>
);

const getPanel = () => screen.getByRole('dialog');
const getRoot = () => getPanel().closest('.MuiDialog-root') as HTMLElement;

describe('MuiCustomDialog Component', () => {
  const defaultProps: MuiCustomDialogProps = {
    'aria-label': 'Test Custom Dialog',
    onClose: vi.fn(),
    children: description,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('should render the dialog with the provided children', () => {
    render(<MuiCustomDialog {...defaultProps} />);

    expect(getPanel()).toBeInTheDocument();
    expect(
      screen.getByText('This is a test dialog content.'),
    ).toBeInTheDocument();
  });

  it('should call the onClose handler when the close button is clicked', () => {
    render(<MuiCustomDialog {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Close dialog'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should use closeLabel as the close button aria-label', () => {
    render(<MuiCustomDialog {...defaultProps} closeLabel="Dismiss" />);

    expect(screen.getByRole('button', {name: 'Dismiss'})).toBeInTheDocument();
  });

  it('should not render the close button if onClose is not provided', () => {
    render(<MuiCustomDialog {...defaultProps} onClose={undefined} />);

    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('should render the close button after the children', () => {
    render(<MuiCustomDialog {...defaultProps} />);

    expect(getPanel().lastElementChild).toBe(
      screen.getByLabelText('Close dialog'),
    );
    expect(getPanel().firstElementChild).toHaveAttribute(
      'id',
      'dsco-dialog-description',
    );
  });

  it('should color the close button from mode', () => {
    const {unmount} = render(<MuiCustomDialog {...defaultProps} />);
    expect(screen.getByLabelText('Close dialog')).toHaveClass(
      'closeButton-dark',
    );
    unmount();

    render(<MuiCustomDialog {...defaultProps} mode="dark" />);
    expect(screen.getByLabelText('Close dialog')).toHaveClass(
      'closeButton-light',
    );
  });

  it('should warn if the description element with id="dsco-dialog-description" is not provided', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(
      <MuiCustomDialog {...defaultProps}>
        <div />
      </MuiCustomDialog>,
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
    render(<MuiCustomDialog>{description}</MuiCustomDialog>);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('should have an aria-label or aria-labelledby'),
    );
    consoleWarnSpy.mockRestore();
  });

  it('should not warn when it is labelled and described', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    render(<MuiCustomDialog {...defaultProps} />);

    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  it('should lock body scroll when rendered', () => {
    render(<MuiCustomDialog {...defaultProps} />);

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('');
  });

  it('should call the onClose handler when the escape key is pressed', () => {
    render(<MuiCustomDialog {...defaultProps} />);
    fireEvent.keyDown(document, {key: 'Escape', code: 'Escape'});

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should let an Escape pressed inside the dialog reach the document listener', () => {
    render(<MuiCustomDialog {...defaultProps} />);
    fireEvent.keyDown(screen.getByLabelText('Close dialog'), {
      key: 'Escape',
      code: 'Escape',
    });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close on a backdrop click', () => {
    render(<MuiCustomDialog {...defaultProps} />);
    const container = getRoot().querySelector(
      '.MuiDialog-container',
    ) as HTMLElement;
    fireEvent.mouseDown(container);
    fireEvent.click(container);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should render additional HTML attributes passed via the props', () => {
    render(<MuiCustomDialog {...defaultProps} role="alertdialog" />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('should put className, id, style, title, data-theme and handlers on the panel', () => {
    const onClick = vi.fn();
    render(
      <MuiCustomDialog
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
    render(<MuiCustomDialog {...defaultProps} />);
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
    render(<MuiCustomDialog {...defaultProps} />);
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
      <MuiCustomDialog
        aria-labelledby="heading"
        aria-describedby="custom-description"
      >
        <h2 id="heading">Heading</h2>
        <p id="dsco-dialog-description">Description</p>
      </MuiCustomDialog>,
    );
    const panel = screen.getByRole('dialog', {name: 'Heading'});

    expect(panel).toHaveAttribute('aria-labelledby', 'heading');
    expect(panel).not.toHaveAttribute('aria-label');
    expect(panel).toHaveAttribute('aria-describedby', 'custom-description');
  });

  it('should render in place, inside the render container', () => {
    const {container} = render(<MuiCustomDialog {...defaultProps} />);

    expect(container.contains(getPanel())).toBe(true);
    expect(container.contains(getRoot())).toBe(true);
  });

  it('should keep the legacy overlay marker and z-index on the MUI root', () => {
    render(<MuiCustomDialog {...defaultProps} />);
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
    render(<MuiCustomDialog {...defaultProps} zIndex={5000} />);

    expect(
      getComputedStyle(getRoot()).getPropertyValue('--cdo-dialog-z-index'),
    ).toBe('5000');
    expect(getRoot().style.zIndex).toBe('');
  });

  it('should aria-hide nothing but the backdrop', () => {
    render(
      <>
        <MuiCustomDialog {...defaultProps} />
        <MuiCustomDialog aria-label="Second">{description}</MuiCustomDialog>
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

  it('should focus the first focusable element on mount and restore focus on unmount', () => {
    const Host = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Opener
          </button>
          {isOpen && (
            <MuiCustomDialog
              aria-label="Focus test"
              onClose={() => setIsOpen(false)}
            >
              <p id="dsco-dialog-description">Description</p>
              <button type="button">First</button>
            </MuiCustomDialog>
          )}
        </>
      );
    };
    render(<Host />);
    const opener = screen.getByRole('button', {name: 'Opener'});
    opener.focus();
    fireEvent.click(opener);

    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'First'}),
    );

    fireEvent.click(screen.getByLabelText('Close dialog'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
  });

  it('should wrap Tab and Shift+Tab inside the panel', () => {
    render(
      <MuiCustomDialog {...defaultProps}>
        <p id="dsco-dialog-description">Description</p>
        <button type="button">First</button>
      </MuiCustomDialog>,
    );
    const first = screen.getByRole('button', {name: 'First'});
    const last = screen.getByLabelText('Close dialog');

    last.focus();
    fireEvent.keyDown(document, {key: 'Tab'});
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, {key: 'Tab', shiftKey: true});
    expect(document.activeElement).toBe(last);
  });

  describe('shared with the legacy CustomDialog', () => {
    const Host = ({legacy, mui}: {legacy: boolean; mui: boolean}) => (
      <>
        {legacy && (
          <CustomDialog aria-label="Legacy">
            <p id="dsco-dialog-description">Legacy</p>
          </CustomDialog>
        )}
        {mui && (
          <MuiCustomDialog aria-label="Mui">
            <p id="dsco-dialog-description">Mui</p>
          </MuiCustomDialog>
        )}
      </>
    );

    it.each([
      ['legacy first', {legacy: false, mui: true}],
      ['MUI first', {legacy: true, mui: false}],
    ])(
      'should restore body scroll only after the last dialog closes (%s)',
      (_order, afterFirstClose) => {
        document.body.style.overflow = 'auto';
        const {rerender} = render(<Host legacy mui />);
        expect(document.body.style.overflow).toBe('hidden');

        rerender(<Host {...afterFirstClose} />);
        expect(document.body.style.overflow).toBe('hidden');

        rerender(<Host legacy={false} mui={false} />);
        expect(document.body.style.overflow).toBe('auto');
        expect(document.body.style.paddingRight).toBe('');
      },
    );

    it.each([
      ['MUI', {legacy: true, mui: false}, {legacy: false, mui: true}],
      ['legacy', {legacy: false, mui: true}, {legacy: true, mui: false}],
    ])(
      'should hold the lock while a later dialog is open after the %s one closes',
      (_first, onlyLater, onlyEarlier) => {
        document.body.style.overflow = 'auto';
        const {rerender} = render(<Host {...onlyEarlier} />);
        rerender(<Host legacy mui />);

        rerender(<Host {...onlyLater} />);
        expect(document.body.style.overflow).toBe('hidden');

        rerender(<Host legacy={false} mui={false} />);
        expect(document.body.style.overflow).toBe('auto');
      },
    );

    it('should call both onClose handlers on Escape', () => {
      const onLegacyClose = vi.fn();
      const onMuiClose = vi.fn();
      render(
        <>
          <CustomDialog aria-label="Legacy" onClose={onLegacyClose}>
            <p id="dsco-dialog-description">Legacy</p>
          </CustomDialog>
          <MuiCustomDialog aria-label="Mui" onClose={onMuiClose}>
            <p id="dsco-dialog-description">Mui</p>
          </MuiCustomDialog>
        </>,
      );
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'Mui'}), {
        key: 'Escape',
        code: 'Escape',
      });

      expect(onLegacyClose).toHaveBeenCalledTimes(1);
      expect(onMuiClose).toHaveBeenCalledTimes(1);
    });
  });
});
