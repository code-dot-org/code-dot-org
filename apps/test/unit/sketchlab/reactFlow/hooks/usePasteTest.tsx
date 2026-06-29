import {renderHook} from '@testing-library/react-hooks';

import {INTERNAL_CLIPBOARD_MARKER} from '@cdo/apps/sketchlab/reactFlow/constants';
import {usePaste} from '@cdo/apps/sketchlab/reactFlow/hooks/usePaste';
import {uploadImageAsset} from '@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset';

jest.mock('@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset');

const mockUploadImageAsset = uploadImageAsset as jest.MockedFunction<
  typeof uploadImageAsset
>;

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function buildPasteEvent(
  items: Array<Partial<DataTransferItem>>,
  text = ''
): Event {
  const event = new Event('paste', {bubbles: true});
  Object.defineProperty(event, 'clipboardData', {
    value: {
      items,
      getData: (type: string) => (type === 'text/plain' ? text : ''),
    },
    writable: false,
  });
  return event;
}

describe('usePaste', () => {
  let container: HTMLDivElement;
  let pasteInternal: jest.Mock;
  let pasteImage: jest.Mock;

  beforeEach(() => {
    mockUploadImageAsset.mockResolvedValue('/v3/assets/channel-1/pasted.png');

    container = document.createElement('div');
    container.tabIndex = -1;
    document.body.appendChild(container);
    container.focus();

    pasteInternal = jest.fn();
    pasteImage = jest.fn();
  });

  afterEach(() => {
    container.remove();
    jest.restoreAllMocks();
    mockUploadImageAsset.mockReset();
  });

  function renderPaste(readOnly = false) {
    const canvasContainerRef = {current: container};
    return renderHook(() =>
      usePaste({
        canvasContainerRef,
        readOnly,
        levelName: 'test-level',
        channelId: 'channel-1',
        pasteInternal,
        pasteImage,
      })
    );
  }

  it('uploads a pasted image and adds an ImageNode', async () => {
    renderPaste();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(mockUploadImageAsset).toHaveBeenCalledWith(file, {
      levelName: 'test-level',
      channelId: 'channel-1',
    });
    expect(pasteImage).toHaveBeenCalledWith('/v3/assets/channel-1/pasted.png');
    expect(pasteInternal).not.toHaveBeenCalled();
  });

  it('pastes the internal element over a stale image when our marker is present', async () => {
    renderPaste();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent(
      [{type: 'image/png', getAsFile: () => file}],
      INTERNAL_CLIPBOARD_MARKER
    );

    container.dispatchEvent(event);
    await flushPromises();

    expect(pasteInternal).toHaveBeenCalledTimes(1);
    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(pasteImage).not.toHaveBeenCalled();
  });

  it('falls back to internal paste when the clipboard has no image', async () => {
    renderPaste();
    const event = buildPasteEvent([
      {type: 'text/plain', getAsFile: () => null},
    ]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(pasteInternal).toHaveBeenCalledTimes(1);
    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(pasteImage).not.toHaveBeenCalled();
  });

  it('ignores pastes when the canvas is not focused', async () => {
    renderPaste();
    container.blur();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    document.body.dispatchEvent(event);
    await flushPromises();

    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(pasteInternal).not.toHaveBeenCalled();
    expect(pasteImage).not.toHaveBeenCalled();
  });

  it('does nothing in read-only mode', async () => {
    renderPaste(true);
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(pasteInternal).not.toHaveBeenCalled();
    expect(pasteImage).not.toHaveBeenCalled();
  });
});
