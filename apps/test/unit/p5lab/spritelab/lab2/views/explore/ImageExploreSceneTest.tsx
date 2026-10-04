import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import ImageExploreScene from '@cdo/apps/p5lab/spritelab/lab2/views/explore/ImageExploreScene';

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
const saveGeneratedImage = jest.fn();
jest.mock(
  '@cdo/apps/p5lab/spritelab/lab2/views/explore/saveGeneratedImage',
  () => ({
    saveGeneratedImage: (...args: unknown[]) => saveGeneratedImage(...args),
  })
);
const continueOrFinishLesson = jest.fn(() => ({type: 'continue'}));
jest.mock('@cdo/apps/lab2/progress/continueOrFinishLesson', () => ({
  __esModule: true,
  default: () => continueOrFinishLesson(),
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

function renderScene(props = {}) {
  const store = createStore(() => ({}));
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <ImageExploreScene imageType="sprite" defaultStyle="pixel" {...props} />
      </ThemeProvider>
    </Provider>
  );
}

const pickCreature = () => {
  fireEvent.click(screen.getByRole('button', {name: 'Choose a creature'}));
  fireEvent.click(screen.getByRole('button', {name: 'cat'}));
};

describe('ImageExploreScene', () => {
  beforeEach(() => {
    generateImage.mockReset();
    generateCharacterSet.mockReset();
    saveGeneratedImage.mockReset();
    continueOrFinishLesson.mockClear();
  });

  it('shows the image area and the editing controls', () => {
    renderScene();
    expect(screen.getByRole('region', {name: 'Your image'})).toBeTruthy();
    const style = screen.getByRole('combobox') as HTMLSelectElement;
    expect(style.value).toBe('pixel');
    expect(screen.getByRole('option', {name: 'Smooth'})).toBeTruthy();
    expect(screen.getByRole('checkbox', {name: 'Make it move'})).toBeTruthy();
    expect(
      (screen.getByRole('button', {name: 'Generate'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    expect(
      screen.getByRole('button', {name: "I'll draw it myself"})
    ).toBeTruthy();
  });

  it('turns the frame into a drawing canvas with pen and eraser only', () => {
    renderScene();
    fireEvent.click(screen.getByRole('button', {name: "I'll draw it myself"}));
    expect(screen.getByRole('region', {name: 'Your drawing'})).toBeTruthy();
    expect(
      screen.getByRole('application', {name: 'Drawing canvas'})
    ).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Pen (P)'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Eraser (E)'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Fill (F)'})).toBeNull();
    const colors = screen.getByRole('group', {name: 'Colors'});
    expect(colors.querySelectorAll('button')).toHaveLength(8);
    expect(screen.queryByRole('button', {name: /Choose color/})).toBeNull();
    const black = screen.getByRole('button', {name: 'Black'});
    const red = screen.getByRole('button', {name: 'Red'});
    expect(black.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(red);
    expect(red.getAttribute('aria-pressed')).toBe('true');
    expect(black.getAttribute('aria-pressed')).toBe('false');
    expect(screen.queryByRole('button', {name: 'Generate'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(screen.getByRole('button', {name: 'Generate'})).toBeTruthy();
    expect(screen.queryByRole('application')).toBeNull();
  });

  it('offers no animation for an object', () => {
    renderScene({imageSubject: 'object'});
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('animates every character in the menu variant, with no checkbox', async () => {
    generateCharacterSet.mockResolvedValue(RESULT);
    renderScene({sentenceUi: 'menu'});
    expect(screen.queryByRole('checkbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'dragon'}));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    expect(generateImage).not.toHaveBeenCalled();
    expect(generateCharacterSet).toHaveBeenCalledTimes(1);
    expect(generateCharacterSet.mock.calls[0][0]).toBe('A dragon');
    expect(generateCharacterSet.mock.calls[0][1]).toMatchObject({
      style: 'pixel',
      bodyPlan: 'quadruped',
    });
  });

  it('shows a fact and a spinner while making the picture, then the two choices', async () => {
    let finish: (value: typeof RESULT) => void = () => {};
    generateImage.mockReturnValue(
      new Promise(resolve => {
        finish = resolve;
      })
    );
    renderScene();
    pickCreature();
    fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /Change it/})).toBeNull();
    expect(
      screen.getByRole('complementary', {name: 'Did you know?'})
    ).toBeTruthy();
    expect(generateImage).toHaveBeenCalledWith(
      'A cat',
      expect.objectContaining({imageType: 'sprite', style: 'pixel'})
    );
    await act(async () => {
      finish(RESULT);
    });
    expect(screen.getByRole('img', {name: 'A cat'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Change words'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Generate again'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Continue'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Generate'})).toBeNull();
    expect(
      screen.queryByRole('button', {name: "I'll draw it myself"})
    ).toBeNull();
  });

  it('reads the sentence back without controls once a picture is made', async () => {
    generateImage.mockResolvedValue(RESULT);
    renderScene();
    pickCreature();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    expect(screen.queryByRole('button', {name: /Change it/})).toBeNull();
    expect(
      screen.queryByRole('button', {name: 'Choose a creature'})
    ).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Change words'}));
    expect(screen.getByRole('button', {name: /creature: cat/})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Generate'})).toBeTruthy();
    expect(screen.getByRole('img', {name: 'A cat'})).toBeTruthy();
  });

  it('shows the prompt as sent behind the link', async () => {
    generateImage.mockResolvedValue(RESULT);
    renderScene();
    pickCreature();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    const info = screen.getByRole('button', {name: 'What we sent the AI'});
    expect(info.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText(/^A cat\. /)).toBeNull();
    fireEvent.click(info);
    expect(info.getAttribute('aria-expanded')).toBe('true');
    const sent = screen.getByText(/^A cat\. /).textContent ?? '';
    expect(sent).toContain('pixel');
    fireEvent.click(screen.getByRole('button', {name: 'Close'}));
    expect(screen.queryByText(/^A cat\. /)).toBeNull();
  });

  it("shows a set's first-picture words and the shared pose words in two tabs", async () => {
    generateCharacterSet.mockResolvedValue(RESULT);
    renderScene({sentenceUi: 'menu'});
    fireEvent.click(screen.getByRole('button', {name: 'dragon'}));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    fireEvent.click(screen.getByRole('button', {name: 'What we sent the AI'}));
    expect(screen.getByRole('tab', {name: 'First picture'})).toBeTruthy();
    expect(screen.getByRole('tabpanel').textContent).toMatch(
      /^A dragon\. Show the whole character/
    );
    fireEvent.click(screen.getByRole('tab', {name: 'Other poses'}));
    const panel = screen.getByRole('tabpanel');
    expect(panel.textContent).toContain('[pose]');
    expect(panel.textContent).toContain('walking:');
    expect(panel.querySelectorAll('li')).toHaveLength(4);
  });

  it('captions the three choices with the question they answer', async () => {
    generateImage.mockResolvedValue(RESULT);
    renderScene();
    pickCreature();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    const group = screen.getByRole('group', {name: 'How did the AI do?'});
    expect(
      [...group.querySelectorAll('button')].map(
        b => b.getAttribute('aria-label') ?? b.textContent?.trim()
      )
    ).toEqual([
      'Thumbs up',
      'Thumbs down',
      'Change words',
      'Generate again',
      'Continue',
    ]);
    const up = screen.getByRole('button', {name: 'Thumbs up'});
    const down = screen.getByRole('button', {name: 'Thumbs down'});
    expect(up.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(down);
    expect(down.getAttribute('aria-pressed')).toBe('true');
    expect(up.getAttribute('aria-pressed')).toBe('false');
  });

  it('makes another picture on Generate again, with the same words', async () => {
    generateImage.mockResolvedValue(RESULT);
    renderScene();
    pickCreature();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate again'}));
    });
    expect(generateImage).toHaveBeenCalledTimes(2);
    expect(generateImage.mock.calls[1][0]).toBe('A cat');
  });

  it('keeps the picture and moves on with Continue', async () => {
    generateImage.mockResolvedValue(RESULT);
    saveGeneratedImage.mockResolvedValue('Sprite 1');
    renderScene({imageRole: 'hero'});
    pickCreature();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Continue'}));
    });
    expect(saveGeneratedImage).toHaveBeenCalledWith(
      expect.any(Function),
      RESULT,
      expect.objectContaining({imageType: 'sprite', imageRole: 'hero'})
    );
    expect(continueOrFinishLesson).toHaveBeenCalled();
  });

  it('says so when the words are not allowed', async () => {
    const {ImageSafetyError} = jest.requireActual(
      '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageSafety'
    );
    generateImage.mockRejectedValue(new ImageSafetyError('prompt'));
    renderScene();
    pickCreature();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    expect(screen.getByRole('alert').textContent).toMatch(/okay for class/);
  });
});
