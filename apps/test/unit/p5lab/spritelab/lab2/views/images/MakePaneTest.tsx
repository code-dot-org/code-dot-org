import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import MakePane from '@cdo/apps/p5lab/spritelab/lab2/views/images/MakePane';
import type {SentenceSceneParts} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/SentenceScene';

const parts = (over: Partial<SentenceSceneParts> = {}): SentenceSceneParts => ({
  mode: 'edit',
  busy: false,
  complete: true,
  panelRef: {current: null},
  frame: null,
  frameFilled: false,
  behindTheScenes: null,
  status: null,
  sentence: <span>sentence</span>,
  wordChooser: <span>words</span>,
  animatedChoice: null,
  error: null,
  tip: null,
  rating: {
    offered: false,
    required: false,
    verdict: null,
    judge: jest.fn(),
    explain: jest.fn(),
    dismiss: jest.fn(),
  },
  exhausted: false,
  generate: jest.fn(),
  draft: {imageType: 'sprite', subject: 'object', style: 'pixel'},
  ...over,
});

describe('MakePane', () => {
  it('shows an error message outside the scrolling box of words', () => {
    render(
      <MakePane
        parts={parts({
          error: <p role="alert">Couldn't make the picture. Try again.</p>,
        })}
        width={280}
      />
    );
    const alert = screen.getByRole('alert');
    const pane = screen.getByRole('region', {name: 'Make your picture'});
    // The message is a direct child of the pane, and the words are not:
    // they are inside the scrolling box.
    expect(alert.parentElement).toBe(pane);
    expect(screen.getByText('words').parentElement).not.toBe(pane);
  });

  it('generates on the button', () => {
    const generate = jest.fn();
    render(<MakePane parts={parts({generate})} width={280} />);
    fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('replaces a picture that only AI made without asking', () => {
    const generate = jest.fn();
    render(
      <MakePane
        parts={parts({generate, mode: 'result', frameFilled: true})}
        width={280}
        regenerate
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Regenerate'}));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('asks before generating over a picture the student has drawn on', () => {
    const generate = jest.fn();
    render(
      <MakePane
        parts={parts({generate, mode: 'result', frameFilled: true})}
        width={280}
        editedByHand
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Regenerate'}));
    expect(generate).not.toHaveBeenCalled();
    expect(
      screen.getByRole('dialog', {name: 'Replace this image?'})
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(generate).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Regenerate'}));
    fireEvent.click(screen.getByRole('button', {name: 'Replace'}));
    expect(generate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('asks before generating over a new drawing that is not saved yet', () => {
    const generate = jest.fn();
    render(<MakePane parts={parts({generate})} width={280} editedByHand />);
    fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    expect(generate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Replace'}));
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('offers Regenerate for an AI-made image, and the drawing button when given', () => {
    const onDraw = jest.fn();
    render(
      <MakePane
        parts={parts()}
        width={280}
        regenerate
        onDraw={onDraw}
        drawLabel="Edit this image"
      />
    );
    expect(screen.getByRole('button', {name: 'Regenerate'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Edit this image'}));
    expect(onDraw).toHaveBeenCalledTimes(1);
  });

  it('draws the info button and the extra controls into the header slot it is given', () => {
    const headerSlot = document.createElement('div');
    document.body.appendChild(headerSlot);
    const shown = (generating = false) => (
      <MakePane
        parts={parts({
          behindTheScenes: <button type="button">info</button>,
          mode: generating ? 'generating' : 'edit',
        })}
        width={280}
        extra={<button type="button">advanced</button>}
        headerSlot={headerSlot}
      />
    );
    const {rerender} = render(shown());
    const pane = screen.getByRole('region', {name: 'Make your picture'});
    // In the slot, not in the pane.
    expect(headerSlot.textContent).toBe('infoadvanced');
    expect(pane.contains(screen.getByText('info'))).toBe(false);
    // Not shown while a picture is being made.
    rerender(shown(true));
    expect(headerSlot.textContent).toBe('');
    headerSlot.remove();
  });
});
