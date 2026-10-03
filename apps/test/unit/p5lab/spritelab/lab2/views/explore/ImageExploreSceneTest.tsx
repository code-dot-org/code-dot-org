import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import ImageExploreScene from '@cdo/apps/p5lab/spritelab/lab2/views/explore/ImageExploreScene';

const generateImage = jest.fn();
jest.mock('@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration', () => ({
  generateImage: (...args: unknown[]) => generateImage(...args),
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
      <ImageExploreScene imageType="sprite" defaultStyle="pixel" {...props} />
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
    saveGeneratedImage.mockReset();
    continueOrFinishLesson.mockClear();
  });

  it('shows the image area and the editing controls', () => {
    renderScene();
    expect(screen.getByRole('region', {name: 'Your image'})).toBeTruthy();
    expect(screen.getByRole('radio', {name: /Pixel/})).toBeTruthy();
    expect(screen.getByRole('radio', {name: /Smooth/})).toBeTruthy();
    expect(screen.getByRole('checkbox', {name: 'Make it move'})).toBeTruthy();
    expect(
      (screen.getByRole('button', {name: 'Generate'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    expect(
      screen.getByRole('button', {name: "I'll draw it myself"})
    ).toBeTruthy();
  });

  it('offers no animation for an object', () => {
    renderScene({imageSubject: 'object'});
    expect(screen.queryByRole('checkbox')).toBeNull();
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
    expect(screen.getByRole('button', {name: 'Try again'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Keep it'})).toBeTruthy();
  });

  it('makes another picture on thumbs down, with the same words', async () => {
    generateImage.mockResolvedValue(RESULT);
    renderScene();
    pickCreature();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Try again'}));
    });
    expect(generateImage).toHaveBeenCalledTimes(2);
    expect(generateImage.mock.calls[1][0]).toBe('A cat');
  });

  it('keeps the picture and moves on with thumbs up', async () => {
    generateImage.mockResolvedValue(RESULT);
    saveGeneratedImage.mockResolvedValue('Sprite 1');
    renderScene({imageRole: 'hero'});
    pickCreature();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Keep it'}));
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
