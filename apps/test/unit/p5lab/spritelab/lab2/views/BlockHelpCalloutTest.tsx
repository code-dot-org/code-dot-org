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
