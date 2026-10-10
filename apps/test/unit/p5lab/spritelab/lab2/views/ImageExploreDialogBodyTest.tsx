import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import ImageExploreDialogBody from '@cdo/apps/p5lab/spritelab/lab2/views/ImageExploreDialogBody';

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

function renderBody(props = {}) {
  const store = createStore(() => ({}));
  const onKeep = jest.fn();
  const onCancel = jest.fn();
  const onPaintManually = jest.fn();
  render(
    <Provider store={store}>
      <ThemeProvider>
        <ImageExploreDialogBody
          imageType="sprite"
          typeChoice
          defaultStyle="pixel"
          onKeep={onKeep}
          onCancel={onCancel}
          onPaintManually={onPaintManually}
          {...props}
        />
      </ThemeProvider>
    </Provider>
  );
  return {onKeep, onCancel, onPaintManually};
}

const footerNames = () =>
  Array.from(document.querySelectorAll('button'))
    .map(b => b.getAttribute('aria-label') || b.textContent?.trim())
    .filter(name =>
      [
        'Cancel',
        'Generate',
        'Generating…',
        'Change words',
        'Generate again',
        'Keep',
        'Good',
        'Not so good',
      ].includes(name || '')
    );

describe('ImageExploreDialogBody', () => {
  beforeEach(() => {
    generateImage.mockReset();
    generateCharacterSet.mockReset();
    sendEvent.mockReset();
  });

  it('offers the Type choice, the words and the style, with Cancel and Generate in the footer', () => {
    renderBody();
    const type = screen.getByRole('combobox', {
      name: 'Type',
    }) as HTMLSelectElement;
    expect(Array.from(type.options).map(o => o.text)).toEqual([
      'Background',
      'Character',
      'Object',
      'Block',
    ]);
    expect(type.value).toBe('character');
    expect(footerNames()).toEqual(['Cancel', 'Generate']);
    expect(screen.getByRole('button', {name: 'Generate'})).toBeDisabled();
    // The blank pane opens the paint editor.
    expect(screen.getByRole('button', {name: 'Paint manually'})).toBeTruthy();
  });

  it('changes the sentence with the Type, dropping the words chosen so far', () => {
    renderBody();
    fireEvent.click(screen.getByRole('button', {name: 'cat'}));
    expect(screen.getByRole('button', {name: 'Generate'})).toBeEnabled();
    fireEvent.change(screen.getByRole('combobox', {name: 'Type'}), {
      target: {value: 'block'},
    });
    expect(screen.getByRole('button', {name: 'Generate'})).toBeDisabled();
  });

  it('locks the Type when told to', () => {
    renderBody({typeChoice: false, imageType: 'block'});
    expect(screen.queryByRole('combobox', {name: 'Type'})).toBeNull();
  });

  it('animates every character, and names the dialog as the surface', async () => {
    generateCharacterSet.mockResolvedValue(RESULT);
    renderBody();
    fireEvent.click(screen.getByRole('button', {name: 'cat'}));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    expect(generateCharacterSet).toHaveBeenCalled();
    expect(generateImage).not.toHaveBeenCalled();
    expect(sendEvent.mock.calls[0][1]).toMatchObject({
      method: 'explore-dialog',
    });
  });

  it('puts the verdict and the three choices in the footer once there is a picture, and Keep hands it to the host', async () => {
    generateCharacterSet.mockResolvedValue(RESULT);
    const {onKeep} = renderBody();
    fireEvent.click(screen.getByRole('button', {name: 'cat'}));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Generate'}));
    });
    expect(footerNames()).toEqual([
      'Good',
      'Not so good',
      'Cancel',
      'Change words',
      'Generate again',
      'Keep',
    ]);
    expect(screen.getByText('Behind the scenes')).toBeTruthy();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Keep'}));
    });
    expect(onKeep).toHaveBeenCalledWith(RESULT);
  });

  it('starts the paint editor from the blank pane with the kind and style chosen', () => {
    const {onPaintManually} = renderBody();
    fireEvent.change(screen.getByRole('combobox', {name: 'Type'}), {
      target: {value: 'block'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Paint manually'}));
    expect(onPaintManually).toHaveBeenCalledWith({
      imageType: 'block',
      style: 'pixel',
    });
  });
});
