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
  cachedTag: null,
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
  it('names the kind with its article, and generates on the button', () => {
    const generate = jest.fn();
    render(<MakePane parts={parts({generate})} width={280} />);
    expect(screen.getByText('Generate an object')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('asks before generating over an existing image, once a sitting', () => {
    const generate = jest.fn();
    const {rerender} = render(
      <MakePane parts={parts({generate})} width={280} replaces />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    expect(generate).not.toHaveBeenCalled();
    expect(
      screen.getByRole('alertdialog', {name: 'Replace this image?'})
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(generate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    fireEvent.click(screen.getByRole('button', {name: 'Replace'}));
    expect(generate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    // A picture has landed: the next generation replaces it without asking.
    rerender(
      <MakePane
        parts={parts({generate, mode: 'result', frameFilled: true})}
        width={280}
        replaces
      />
    );
    fireEvent.click(screen.getByRole('button', {name: 'Regenerate'}));
    expect(generate).toHaveBeenCalledTimes(2);
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
    expect(screen.getByText('Regenerate this object')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Edit this image'}));
    expect(onDraw).toHaveBeenCalledTimes(1);
  });
});
