import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import SentenceScene, {
  SentenceSceneParts,
} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/SentenceScene';

const generateImage = jest.fn();
jest.mock('@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration', () => ({
  ...jest.requireActual(
    '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration'
  ),
  generateImage: (...args: unknown[]) => generateImage(...args),
}));
const generateCharacterSet = jest.fn();
jest.mock('@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet', () => ({
  ...jest.requireActual(
    '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet'
  ),
  generateCharacterSet: (...args: unknown[]) => generateCharacterSet(...args),
}));
const sendEvent = jest.fn();
jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: (...args: unknown[]) => sendEvent(...args)},
}));

// A 1x1 PNG, enough for a data URI.
const PNG = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
  0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120,
  156, 99, 248, 255, 255, 63, 0, 5, 254, 2, 254, 167, 53, 129, 132, 0, 0, 0, 0,
  73, 69, 78, 68, 174, 66, 96, 130,
]);
const RESULT = {
  filename: 'cat.png',
  uint8Array: PNG,
  mediaType: 'image/png',
  generation: {prompt: 'A cat', imageType: 'sprite', style: 'pixel'},
};

// A host that lays every part out, with buttons for the callbacks.
const layout = (parts: SentenceSceneParts) => (
  <div>
    <div>{parts.frame}</div>
    {parts.alternatives}
    {parts.underFrame}
    <section ref={parts.panelRef} tabIndex={-1} aria-label="Make your picture">
      {parts.status}
      {parts.typeChoice}
      {parts.sentence}
      {parts.animatedChoice}
      {parts.error}
      {parts.progress}
      {parts.rating.offered && (
        <div role="group" aria-label="How did the AI do?">
          <button type="button" onClick={() => parts.rating.judge('up')}>
            Good
          </button>
          <button type="button" onClick={() => parts.rating.judge('down')}>
            Not so good
          </button>
          <button
            type="button"
            onClick={() => parts.rating.explain(['mismatch', 'colors'])}
          >
            Explain
          </button>
          <span>{parts.rating.verdict ?? 'unrated'}</span>
        </div>
      )}
      <button
        type="button"
        disabled={!parts.complete || parts.busy || parts.exhausted}
        onClick={parts.generate}
      >
        {parts.mode === 'result' ? 'Generate again' : 'Generate'}
      </button>
      <button type="button" onClick={parts.changeWords}>
        Change words
      </button>
    </section>
  </div>
);

const onKeep = jest.fn();

function renderScene(props = {}) {
  return render(
    <ThemeProvider>
      <SentenceScene
        imageType="sprite"
        onKeep={onKeep}
        layout={layout}
        {...props}
      />
    </ThemeProvider>
  );
}

// The creature set shows first; a character's picture is a set of frames.
const pickCreature = () => {
  fireEvent.click(screen.getByRole('button', {name: 'cat'}));
};

// The last step's tick shows this long before the picture replaces it.
const SETTLE_MS = 500;

// A generation that waits for the test to finish it.
const pendingGeneration = () => {
  let finish: (value: typeof RESULT) => void = () => {};
  generateCharacterSet.mockReturnValueOnce(
    new Promise(resolve => {
      finish = resolve;
    })
  );
  return (value: typeof RESULT) => finish(value);
};

// Presses Generate (or Generate again) and waits out the settle.
const generate = async (name = 'Generate') => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', {name}));
  });
  await act(async () => {
    jest.advanceTimersByTime(SETTLE_MS);
  });
};

describe('SentenceScene', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    generateImage.mockReset();
    generateCharacterSet.mockReset();
    onKeep.mockReset();
    sendEvent.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('holds Generate until the sentence is complete', () => {
    renderScene();
    expect(
      (screen.getByRole('button', {name: 'Generate'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    pickCreature();
    expect(
      (screen.getByRole('button', {name: 'Generate'}) as HTMLButtonElement)
        .disabled
    ).toBe(false);
  });

  it('makes one picture for an object', async () => {
    generateImage.mockResolvedValue(RESULT);
    renderScene({imageSubject: 'object'});
    expect(screen.queryByRole('checkbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'key'}));
    await generate();
    expect(generateImage).toHaveBeenCalledTimes(1);
    expect(generateCharacterSet).not.toHaveBeenCalled();
  });

  it('animates a character unless Animated is unticked', async () => {
    generateCharacterSet.mockResolvedValue(RESULT);
    generateImage.mockResolvedValue(RESULT);
    renderScene();
    const box = screen.getByRole('checkbox', {name: 'Animated'});
    expect((box as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole('button', {name: 'dragon'}));
    await generate();
    expect(generateCharacterSet).toHaveBeenCalledTimes(1);
    expect(generateCharacterSet.mock.calls[0][0]).toBe('A dragon');
    expect(generateCharacterSet.mock.calls[0][1]).toMatchObject({
      style: 'pixel',
      bodyPlan: 'quadruped',
    });
    fireEvent.click(screen.getByRole('button', {name: 'Change words'}));
    fireEvent.click(screen.getByRole('checkbox', {name: 'Animated'}));
    await generate();
    expect(generateImage).toHaveBeenCalledTimes(1);
  });

  it('keeps the picture as it lands, and again with its rating', async () => {
    generateCharacterSet.mockResolvedValue(RESULT);
    renderScene();
    pickCreature();
    await generate();
    expect(onKeep).toHaveBeenCalledTimes(1);
    expect(onKeep.mock.calls[0][0].generation.verdict).toBeUndefined();
    fireEvent.click(screen.getByRole('button', {name: 'Good'}));
    expect(onKeep).toHaveBeenCalledTimes(2);
    expect(onKeep.mock.calls[1][0].generation.verdict).toBe('up');
    expect(screen.getByText('up')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Explain'}));
    expect(sendEvent).toHaveBeenCalledWith(
      'hoai2026-image-verdict-reason',
      expect.objectContaining({reasons: ['mismatch', 'colors']}),
      true
    );
  });

  it('shows the making of the picture, then reads the words back', async () => {
    const finish = pendingGeneration();
    renderScene();
    pickCreature();
    fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    expect(screen.getByRole('status').textContent).toBe('Making your picture…');
    expect(
      screen.getByRole('list', {name: 'What the AI is doing'})
    ).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'cat'})).toBeNull();
    await act(async () => {
      finish(RESULT);
    });
    await act(async () => {
      jest.advanceTimersByTime(SETTLE_MS);
    });
    expect(screen.getByRole('status').textContent).toBe(
      'Your picture is ready.'
    );
    expect(screen.getByRole('img', {name: 'A cat'})).toBeTruthy();
    expect(
      screen.getByRole('button', {name: 'Behind the scenes'})
    ).toBeTruthy();
    expect(
      screen.getByRole('group', {name: 'How did the AI do?'})
    ).toBeTruthy();
  });

  it('holds Generate once the generations are used up', () => {
    renderScene({generationsLeft: 0});
    pickCreature();
    expect(
      (screen.getByRole('button', {name: 'Generate'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it('shows every picture as a tile and swaps one in, keeping it, without a question', async () => {
    generateCharacterSet
      .mockResolvedValueOnce(RESULT)
      .mockResolvedValueOnce({...RESULT, filename: 'cat2.png'});
    renderScene();
    pickCreature();
    await generate();
    await generate('Generate again');
    const tiles = screen.getAllByRole('button', {name: /^Picture \d: A cat$/});
    expect(tiles).toHaveLength(2);
    expect(onKeep).toHaveBeenCalledTimes(2);
    fireEvent.click(tiles[0]);
    expect(onKeep).toHaveBeenCalledTimes(3);
    expect(onKeep.mock.calls[2][0].filename).toBe('cat.png');
    expect(
      screen.queryByRole('group', {name: 'How did the AI do?'})
    ).toBeNull();
  });

  it('asks about any picture when the level rates every one', async () => {
    generateCharacterSet
      .mockResolvedValueOnce(RESULT)
      .mockResolvedValueOnce({...RESULT, filename: 'cat2.png'});
    renderScene({verdictRequired: true});
    pickCreature();
    await generate();
    await generate('Generate again');
    fireEvent.click(
      screen.getAllByRole('button', {name: /^Picture \d: A cat$/})[0]
    );
    expect(
      screen.getByRole('group', {name: 'How did the AI do?'})
    ).toBeTruthy();
  });

  it('says so when the words are not allowed', async () => {
    const {ImageSafetyError} = jest.requireActual(
      '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageSafety'
    );
    generateCharacterSet.mockRejectedValue(new ImageSafetyError('prompt'));
    renderScene();
    pickCreature();
    await generate();
    expect(screen.getByRole('alert').textContent).toMatch(/aren't okay/);
    expect(screen.getByRole('button', {name: 'Generate'})).toBeTruthy();
  });

  it('takes a typed prompt over the words, as one still picture at the chosen grid, from the current image', async () => {
    generateImage.mockResolvedValue(RESULT);
    const startFrom = jest.fn(async () => 'data:image/png;base64,abc');
    renderScene({
      advanced: {prompt: 'a tiny robot', pixelScale: 2, startFrom},
    });
    expect(screen.queryByRole('checkbox')).toBeNull();
    await generate();
    expect(generateCharacterSet).not.toHaveBeenCalled();
    expect(generateImage).toHaveBeenCalledTimes(1);
    expect(generateImage.mock.calls[0][0]).toBe('a tiny robot');
    expect(generateImage.mock.calls[0][1]).toMatchObject({
      pixelGrid: 32,
      inputImageDataURI: 'data:image/png;base64,abc',
    });
    expect(sendEvent).toHaveBeenCalledWith(
      'hoai2026-image-prompt',
      expect.objectContaining({method: 'freeText'}),
      true
    );
  });
});
