import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import BlockHelpCallout from '@cdo/apps/p5lab/spritelab/lab2/views/BlockHelpCallout';

const help = {
  title: 'Set gravity',
  summary: 'Changes how hard the platformer pulls everything down.',
  body: <p>0 turns gravity off.</p>,
};

const anchor = {
  top: 300,
  right: 200,
  height: 20,
  width: 20,
  left: 180,
  bottom: 320,
} as DOMRect;

describe('BlockHelpCallout', () => {
  it('shows the title, summary and body', () => {
    render(
      <BlockHelpCallout help={help} anchor={anchor} onClose={jest.fn()} />
    );
    const dialog = screen.getByRole('dialog', {name: 'Set gravity'});
    expect(dialog.textContent).toContain(help.summary);
    expect(dialog.textContent).toContain('0 turns gravity off.');
  });

  it('shows an animation beside the text only when the help has one', () => {
    const {rerender} = render(
      <BlockHelpCallout help={help} anchor={anchor} onClose={jest.fn()} />
    );
    expect(screen.queryByRole('img')).toBeNull();
    const animated = {
      ...help,
      animation: {src: 'set-gravity.gif', alt: 'A character floats.'},
    };
    rerender(
      <BlockHelpCallout help={animated} anchor={anchor} onClose={jest.fn()} />
    );
    const img = screen.getByRole('img', {name: 'A character floats.'});
    expect(img.getAttribute('src')).toBe('set-gravity.gif');
    // The animation comes first in the row, so it reads and sits on the left.
    expect(img.compareDocumentPosition(screen.getByText(help.summary))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('opens to the right of the icon', () => {
    render(
      <BlockHelpCallout help={help} anchor={anchor} onClose={jest.fn()} />
    );
    const dialog = screen.getByRole('dialog', {name: 'Set gravity'});
    expect(dialog.style.left).toBe('212px');
  });

  it('closes on Escape, on the close button, and on a press outside', () => {
    const onClose = jest.fn();
    render(<BlockHelpCallout help={help} anchor={anchor} onClose={onClose} />);
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', {name: 'Close'}));
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.pointerDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(3);
    fireEvent.pointerDown(screen.getByRole('dialog', {name: 'Set gravity'}));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
