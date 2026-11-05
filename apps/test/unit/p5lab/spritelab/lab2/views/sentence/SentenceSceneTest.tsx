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
const findCachedImage = jest.fn();
jest.mock('@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache', () => ({
  ...jest.requireActual('@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache'),
  findCachedImage: (...args: unknown[]) => findCachedImage(...args),
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
    <div>
      {parts.frame}
      {parts.cachedTag}
    </div>
    {parts.behindTheScenes}
    <section ref={parts.panelRef} tabIndex={-1} aria-label="Make your picture">
      {parts.status}
      {parts.sentence}
      {parts.wordChooser}
      {parts.animatedChoice}
      {parts.error}
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
          <button type="button" onClick={parts.rating.dismiss}>
            Dismiss
          </button>
          <span>{parts.rating.verdict ?? 'unrated'}</span>
        </div>
      )}
      <button
        type="button"
        disabled={!parts.complete || parts.busy || parts.exhausted}
        onClick={parts.generate}
      >
        Generate
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

// Presses Generate and lets the picture land.
const generate = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
  });
};

describe('SentenceScene', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    generateImage.mockReset();
    generateCharacterSet.mockReset();
    findCachedImage.mockReset();
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
    // The words and the Animated box stay open under the picture.
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
    // The reasons end the rating: its strip is gone.
    expect(
      screen.queryByRole('group', {name: 'How did the AI do?'})
    ).toBeNull();
  });

  it('puts the rating away unanswered on Dismiss, until the next picture', async () => {
    generateCharacterSet.mockResolvedValue(RESULT);
    renderScene();
    pickCreature();
    await generate();
    expect(
      screen.getByRole('group', {name: 'How did the AI do?'})
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(
      screen.queryByRole('group', {name: 'How did the AI do?'})
    ).toBeNull();
    await generate();
    expect(
      screen.getByRole('group', {name: 'How did the AI do?'})
    ).toBeTruthy();
  });

  it('records the words on the picture, and puts saved words back', async () => {
    generateCharacterSet.mockResolvedValue(RESULT);
    renderScene({
      initialChoices: {
        sentenceId: 'character',
        choices: {creature: 'dragon', adjective: 'gigantic'},
      },
    });
    // The dragon is back; the adjective the list no longer has is not.
    expect(screen.getByRole('button', {name: 'Remove dragon'})).toBeTruthy();
    expect(screen.queryByText('gigantic')).toBeNull();
    await generate();
    expect(onKeep.mock.calls[0][0].generation).toMatchObject({
      sentenceId: 'character',
      choices: {creature: 'dragon'},
    });
  });

  it('shows the making of the picture, then the picture with the words still open', async () => {
    const finish = pendingGeneration();
    renderScene();
    pickCreature();
    fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    expect(screen.getByRole('status').textContent).toBe('Making your picture…');
    expect(screen.queryByRole('button', {name: 'cat'})).toBeNull();
    await act(async () => {
      finish(RESULT);
    });
    expect(screen.getByText('Your picture is ready.')).toBeTruthy();
    expect(screen.getByRole('img', {name: 'A cat'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'cat'})).toBeTruthy();
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
      // Half the sprite's 32x32 grid.
      pixelGrid: 16,
      inputImageDataURI: 'data:image/png;base64,abc',
    });
    expect(sendEvent).toHaveBeenCalledWith(
      'hoai2026-image-prompt',
      expect.objectContaining({method: 'freeText'}),
      true
    );
  });

  describe('on a cached level', () => {
    const CACHED = {variant: 1, characterSet: true, raw: jest.fn()};
    const onGenerateStart = jest.fn();
    const renderCached = (props = {}) =>
      renderScene({imageSource: 'cached', onGenerateStart, ...props});

    beforeEach(() => {
      onGenerateStart.mockReset();
    });

    it('shows the making at once, and for a while after the picture lands', async () => {
      findCachedImage.mockResolvedValue(CACHED);
      generateCharacterSet.mockResolvedValue(RESULT);
      renderCached();
      pickCreature();
      await generate();
      expect(screen.getByRole('status').textContent).toBe(
        'Making your picture…'
      );
      expect(generateCharacterSet.mock.calls[0][1]).toMatchObject({
        cached: CACHED,
      });
      expect(onGenerateStart).toHaveBeenCalledTimes(1);
      await act(async () => {
        jest.advanceTimersByTime(4999);
      });
      expect(screen.getByRole('status').textContent).toBe(
        'Making your picture…'
      );
      await act(async () => {
        jest.advanceTimersByTime(1);
      });
      expect(screen.getByText('Your picture is ready.')).toBeTruthy();
      expect(screen.getByText('cached')).toBeTruthy();
      expect(sendEvent).toHaveBeenCalledWith(
        'hoai2026-image-prompt',
        expect.objectContaining({imageSource: 'cached', cached: true}),
        true
      );
    });

    it('asks for another variant than the one shown, for the same words', async () => {
      findCachedImage.mockResolvedValue(CACHED);
      generateCharacterSet.mockResolvedValue(RESULT);
      renderCached();
      pickCreature();
      await generate();
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      await generate();
      expect(findCachedImage.mock.calls[0][0].avoidVariant).toBeUndefined();
      expect(findCachedImage.mock.calls[1][0].avoidVariant).toBe(1);
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      fireEvent.click(screen.getByRole('button', {name: 'dragon'}));
      await generate();
      expect(findCachedImage.mock.calls[2][0].avoidVariant).toBeUndefined();
    });

    it('draws with the model when the tree lacks the words, at its own pace', async () => {
      findCachedImage.mockResolvedValue(undefined);
      generateCharacterSet.mockResolvedValue(RESULT);
      renderCached();
      pickCreature();
      await generate();
      expect(generateCharacterSet.mock.calls[0][1].cached).toBeUndefined();
      expect(screen.getByText('Your picture is ready.')).toBeTruthy();
      expect(screen.queryByText('cached')).toBeNull();
      expect(onGenerateStart).toHaveBeenCalledTimes(1);
      expect(sendEvent).toHaveBeenCalledWith(
        'hoai2026-image-prompt',
        expect.objectContaining({imageSource: 'cached', cached: false}),
        true
      );
    });

    it('draws with the model when the lookup fails', async () => {
      findCachedImage.mockRejectedValue(new TypeError('Failed to fetch'));
      generateCharacterSet.mockResolvedValue(RESULT);
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      renderCached();
      pickCreature();
      await generate();
      expect(generateCharacterSet).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Your picture is ready.')).toBeTruthy();
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('never looks when the level names the model', async () => {
      generateCharacterSet.mockResolvedValue(RESULT);
      renderScene({imageSource: 'live'});
      pickCreature();
      await generate();
      expect(findCachedImage).not.toHaveBeenCalled();
      expect(screen.getByText('Your picture is ready.')).toBeTruthy();
    });

    it('goes to the model when the advanced settings change the request', async () => {
      generateCharacterSet.mockResolvedValue(RESULT);
      renderCached({advanced: {pixelScale: 2}});
      pickCreature();
      await generate();
      expect(findCachedImage).not.toHaveBeenCalled();
      expect(generateCharacterSet.mock.calls[0][1].cached).toBeUndefined();
      expect(screen.getByText('Your picture is ready.')).toBeTruthy();
    });
  });
});
