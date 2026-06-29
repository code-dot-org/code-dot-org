import {renderHook} from '@testing-library/react-hooks';

import {usePasteImage} from '@cdo/apps/sketchlab/reactFlow/hooks/usePasteImage';
import {uploadImageAsset} from '@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset';

jest.mock('@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset');

const mockUploadImageAsset = uploadImageAsset as jest.MockedFunction<
  typeof uploadImageAsset
>;

// Decode immediately with a fixed natural size so dimension scaling is
// deterministic. The hook assigns onload before setting src, so calling it from
// the src setter is enough.
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 800;
  naturalHeight = 400;
  set src(_value: string) {
    this.onload?.();
  }
}

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function buildPasteEvent(items: Array<Partial<DataTransferItem>>): Event {
  const event = new Event('paste', {bubbles: true});
  Object.defineProperty(event, 'clipboardData', {
    value: {items},
    writable: false,
  });
  return event;
}

describe('usePasteImage', () => {
  let container: HTMLDivElement;
  let pasteInternal: jest.Mock;
  let addImageNode: jest.Mock;
  const originalImage = window.Image;

  beforeEach(() => {
    window.Image = MockImage as unknown as typeof Image;
    // jsdom does not implement these, so define rather than spy.
    URL.createObjectURL = jest.fn().mockReturnValue('blob:fake');
    URL.revokeObjectURL = jest.fn();
    mockUploadImageAsset.mockResolvedValue('/v3/assets/channel-1/pasted.png');

    container = document.createElement('div');
    container.tabIndex = -1;
    document.body.appendChild(container);
    container.focus();

    pasteInternal = jest.fn();
    addImageNode = jest.fn();
  });

  afterEach(() => {
    window.Image = originalImage;
    container.remove();
    jest.restoreAllMocks();
    mockUploadImageAsset.mockReset();
  });

  function renderPasteImage(readOnly = false) {
    const canvasContainerRef = {current: container};
    return renderHook(() =>
      usePasteImage({
        canvasContainerRef,
        readOnly,
        levelName: 'test-level',
        channelId: 'channel-1',
        pasteInternal,
        addImageNode,
      })
    );
  }

  it('uploads a pasted image and adds an aspect-ratio-scaled ImageNode', async () => {
    renderPasteImage();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(mockUploadImageAsset).toHaveBeenCalledWith(file, {
      levelName: 'test-level',
      channelId: 'channel-1',
    });
    expect(addImageNode).toHaveBeenCalledWith(
      {
        type: 'image',
        data: {src: '/v3/assets/channel-1/pasted.png', altText: ''},
      },
      // 800x400 scaled to fit 320 on the longest side.
      {width: 320, height: 160}
    );
    expect(pasteInternal).not.toHaveBeenCalled();
  });

  it('falls back to internal paste when the clipboard has no image', async () => {
    renderPasteImage();
    const event = buildPasteEvent([
      {type: 'text/plain', getAsFile: () => null},
    ]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(pasteInternal).toHaveBeenCalledTimes(1);
    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(addImageNode).not.toHaveBeenCalled();
  });

  it('ignores pastes when the canvas is not focused', async () => {
    renderPasteImage();
    container.blur();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    document.body.dispatchEvent(event);
    await flushPromises();

    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(pasteInternal).not.toHaveBeenCalled();
    expect(addImageNode).not.toHaveBeenCalled();
  });

  it('does nothing in read-only mode', async () => {
    renderPasteImage(true);
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(pasteInternal).not.toHaveBeenCalled();
    expect(addImageNode).not.toHaveBeenCalled();
  });
});
