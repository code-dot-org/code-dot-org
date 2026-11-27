import {render, screen, fireEvent, waitFor} from '@testing-library/react';
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

  const controlNames = () =>
    Array.from(
      screen.getByRole('dialog').querySelectorAll('a, button, input'),
    ).map(el => el.getAttribute('aria-label') || el.textContent);

  it('should put startActions before the buttons, and the close button last', () => {
    render(
      <Modal
        {...defaultProps}
        secondaryButtonProps={{children: 'Secondary Action'}}
        startActions={
          <>
            <a href="#help">Help</a>
            <input type="checkbox" aria-label="Remember" />
          </>
        }
      />,
    );
    expect(controlNames()).toEqual([
      'Help',
      'Remember',
      'Secondary Action',
      'Primary Action',
      'Close modal',
    ]);
  });

  it('should keep the button order without startActions', () => {
    render(
      <Modal
        {...defaultProps}
        secondaryButtonProps={{children: 'Secondary Action'}}
      />,
    );
    expect(controlNames()).toEqual([
      'Secondary Action',
      'Primary Action',
      'Close modal',
    ]);
  });

  it('should give startActions first focus on mount', async () => {
    render(<Modal {...defaultProps} startActions={<a href="#help">Help</a>} />);
    await waitFor(() =>
      expect(screen.getByRole('link', {name: 'Help'})).toHaveFocus(),
    );
  });

  it('should render customBottomContent after the action buttons', () => {
    render(
      <Modal
        {...defaultProps}
        customBottomContent={<button type="button">Bottom</button>}
      />,
    );
    expect(controlNames()).toEqual(['Primary Action', 'Bottom', 'Close modal']);
  });

  describe('when the content overflows', () => {
    // jsdom lays nothing out; these shadow Element's zero getters.
    const proto = HTMLElement.prototype;

    beforeEach(() => {
      Object.defineProperty(proto, 'scrollHeight', {
        configurable: true,
        get() {
          return this.querySelector('#dsco-dialog-description') ? 500 : 0;
        },
      });
      Object.defineProperty(proto, 'clientHeight', {
        configurable: true,
        get: () => 200,
      });
    });

    afterEach(() => {
      Reflect.deleteProperty(proto, 'scrollHeight');
      Reflect.deleteProperty(proto, 'clientHeight');
    });

    it('should leave the tab stop to a control in the content', async () => {
      render(
        <Modal {...defaultProps} customContent={<input aria-label="Name" />} />,
      );
      const content = screen.getByText(defaultProps.description!).parentElement;
      expect(content).toHaveAttribute('tabindex', '-1');
      await waitFor(() =>
        expect(screen.getByRole('textbox', {name: 'Name'})).toHaveFocus(),
      );
    });

    it('should make the content a tab stop and focus it first', async () => {
      render(<Modal {...defaultProps} />);
      const content = screen.getByText(defaultProps.description!).parentElement;
      expect(content).toHaveAttribute('tabindex', '0');
      await waitFor(() => expect(content).toHaveFocus());
    });
  });

  it('should keep the content out of the tab order when it fits', async () => {
    render(<Modal {...defaultProps} />);
    const content = screen.getByText(defaultProps.description!).parentElement;
    expect(content).toHaveAttribute('tabindex', '-1');
    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: 'Primary Action'}),
      ).toHaveFocus(),
    );
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
    expect(document.querySelector('.MuiBackdrop-root')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
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

  it('should focus the first button once entered and restore focus on unmount', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const {unmount} = render(<Modal {...defaultProps} />);
    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: 'Primary Action'}),
      ).toHaveFocus(),
    );
    unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });
});
