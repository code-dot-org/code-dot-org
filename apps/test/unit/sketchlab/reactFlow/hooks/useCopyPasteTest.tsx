import {renderHook} from '@testing-library/react-hooks';

import {
  INTERNAL_CLIPBOARD_MARKER,
  INTERNAL_CLIPBOARD_MIME,
} from '@cdo/apps/sketchlab/reactFlow/constants';
import {useCopyPaste} from '@cdo/apps/sketchlab/reactFlow/hooks/useCopyPaste';

// Stub useReactFlow so the hook runs without a mounted ReactFlow. The paste
// path only needs screenToFlowPosition (identity here) and deleteElements.
jest.mock('@xyflow/react', () => ({
  useReactFlow: () => ({
    deleteElements: jest.fn(),
    screenToFlowPosition: (point: {x: number; y: number}) => point,
  }),
}));

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function buildPasteEvent(
  items: Array<Partial<DataTransferItem>>,
  {internalCopy = false}: {internalCopy?: boolean} = {}
): Event {
  const event = new Event('paste', {bubbles: true});
  Object.defineProperty(event, 'clipboardData', {
    value: {
      items,
      getData: (type: string) =>
        type === INTERNAL_CLIPBOARD_MIME && internalCopy
          ? INTERNAL_CLIPBOARD_MARKER
          : '',
    },
    writable: false,
  });
  return event;
}

describe('useCopyPaste paste handling', () => {
  let container: HTMLDivElement;
  let setNodes: jest.Mock;
  let setEdges: jest.Mock;
  let uploadImage: jest.Mock;
  let onImageUploadError: jest.Mock;

  beforeEach(() => {
    // Successful moderated upload: hand the asset URL to the continuation.
    uploadImage = jest.fn(async ({onUploaded}) =>
      onUploaded('/v3/assets/channel-1/pasted.png')
    );

    container = document.createElement('div');
    container.tabIndex = -1;
    document.body.appendChild(container);
    container.focus();

    setNodes = jest.fn();
    setEdges = jest.fn();
    onImageUploadError = jest.fn();
  });

  afterEach(() => {
    container.remove();
    jest.restoreAllMocks();
  });

  function renderCopyPaste(readOnly = false) {
    const canvasContainerRef = {current: container};
    return renderHook(() =>
      useCopyPaste({
        nodes: [],
        edges: [],
        setNodes,
        setEdges,
        pushSnapshot: jest.fn(),
        canvasContainerRef,
        readOnly,
        uploadImage,
        onImageUploadError,
      })
    );
  }

  it('uploads a pasted image and adds an ImageNode at the cursor', async () => {
    renderCopyPaste();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(uploadImage).toHaveBeenCalledWith(
      expect.objectContaining({file, onError: onImageUploadError})
    );
    expect(setNodes).toHaveBeenCalledTimes(1);
    const addedNodes = setNodes.mock.calls[0][0]([]);
    expect(addedNodes).toHaveLength(1);
    expect(addedNodes[0].type).toBe('image');
    expect(addedNodes[0].data.src).toBe('/v3/assets/channel-1/pasted.png');
    expect(onImageUploadError).not.toHaveBeenCalled();
  });

  it('reports an error and adds no node when the upload fails', async () => {
    uploadImage.mockImplementation(async ({onError}) => onError());
    renderCopyPaste();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(onImageUploadError).toHaveBeenCalledTimes(1);
    expect(setNodes).not.toHaveBeenCalled();
  });

  it('adds no node when a flagged upload is left pending', async () => {
    // A flagged verdict defers the upload until the user answers the modal;
    // uploadImage resolves without invoking either callback.
    uploadImage.mockImplementation(async () => {});
    renderCopyPaste();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(uploadImage).toHaveBeenCalledTimes(1);
    expect(setNodes).not.toHaveBeenCalled();
    expect(onImageUploadError).not.toHaveBeenCalled();
  });

  it('ignores a stale clipboard image when our copy marker is present', async () => {
    renderCopyPaste();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent(
      [{type: 'image/png', getAsFile: () => file}],
      {internalCopy: true}
    );

    container.dispatchEvent(event);
    await flushPromises();

    // Marker present -> internal paste path; the (empty) clipboard yields no
    // nodes and no upload happens.
    expect(uploadImage).not.toHaveBeenCalled();
    expect(setNodes).not.toHaveBeenCalled();
  });

  it('ignores pastes when focus is on another element', async () => {
    renderCopyPaste();
    const otherInput = document.createElement('input');
    document.body.appendChild(otherInput);
    otherInput.focus();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    otherInput.dispatchEvent(event);
    await flushPromises();

    expect(uploadImage).not.toHaveBeenCalled();
    expect(setNodes).not.toHaveBeenCalled();
    otherInput.remove();
  });

  it('ignores pastes when the canvas is not focused', async () => {
    renderCopyPaste();
    container.blur();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    document.body.dispatchEvent(event);
    await flushPromises();

    expect(uploadImage).not.toHaveBeenCalled();
    expect(setNodes).not.toHaveBeenCalled();
  });

  it('does nothing in read-only mode', async () => {
    renderCopyPaste(true);
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(uploadImage).not.toHaveBeenCalled();
    expect(setNodes).not.toHaveBeenCalled();
  });
});
