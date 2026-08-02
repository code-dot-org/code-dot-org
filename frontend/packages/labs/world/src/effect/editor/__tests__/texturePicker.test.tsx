// The test-texture picker, in the design system's dialog.
//
// Two things about it are load-bearing and neither is visible in a screenshot:
// it renders INLINE, because a portal would leave the `data-notranslate`
// container and hand already-translated strings back to the DOM translator; and
// it is mounted only while open, because `CustomDialog` locks body scroll for as
// long as it exists.

import {render, screen, fireEvent} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {createEffectDocument} from '../../model/document';
import {EffectEditor} from '../EffectEditor';

const editor = () =>
  render(<EffectEditor initialDocument={createEffectDocument()} />).container;

const open = (container: HTMLElement) => {
  fireEvent.click(screen.getByRole('button', {name: 'Change test texture'}));
  return container.querySelector('[role="dialog"]');
};

describe('the test-texture picker', () => {
  it('is not in the tree until it is asked for', () => {
    const container = editor();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('opens inside the editor, not through a portal', () => {
    const container = editor();
    const dialog = open(container);
    expect(dialog).not.toBeNull();
    // Inside the container React rendered — which is what carries
    // `data-notranslate`. A portalled dialog would be on document.body.
    expect(container.contains(dialog)).toBe(true);
    expect(document.body.querySelector(':scope > [role="dialog"]')).toBeNull();
  });

  it('is a dialog, named and described, not an alert', () => {
    // `Dialog` supplies the name and the description from its `title` and
    // `description` props — and declares `role="alertdialog"`, which announces
    // something that needs answering now. This is a picker.
    const container = editor();
    const dialog = open(container)!;
    expect(dialog.getAttribute('aria-label')).toBe('Choose a test texture');
    expect(dialog.querySelector('#dsco-dialog-description')).not.toBeNull();
    expect(container.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('marks the texture the previews are running on', () => {
    const dialog = open(editor())!;
    const pressed = [...dialog.querySelectorAll('button[aria-pressed="true"]')];
    expect(pressed).toHaveLength(1);
    expect(pressed[0].textContent).toContain('Checkerboard');
  });

  it('defers the choice: a row selects, `Use texture` commits', () => {
    // The dialog covers the previews it changes, so a click that applied
    // straight away would be a change nobody can see until it goes away.
    const container = editor();
    open(container);

    fireEvent.click(screen.getByRole('button', {name: /Gradient/}));
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(screen.getByRole('button', {name: /Gradient/})).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', {name: 'Use texture'}));
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});
