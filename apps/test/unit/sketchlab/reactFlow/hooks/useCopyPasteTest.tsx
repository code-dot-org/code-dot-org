import {renderHook} from '@testing-library/react-hooks';

import {INTERNAL_CLIPBOARD_MARKER} from '@cdo/apps/sketchlab/reactFlow/constants';
import {useCopyPaste} from '@cdo/apps/sketchlab/reactFlow/hooks/useCopyPaste';
import {uploadImageAsset} from '@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset';

jest.mock('@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset');

// Stub useReactFlow so the hook runs without a mounted ReactFlow. The paste
// path only needs screenToFlowPosition (identity here) and deleteElements.
jest.mock('@xyflow/react', () => ({
  useReactFlow: () => ({
    deleteElements: jest.fn(),
    screenToFlowPosition: (point: {x: number; y: number}) => point,
  }),
}));

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

describe('useCopyPaste paste handling', () => {
  let container: HTMLDivElement;
  let setNodes: jest.Mock;
  let setEdges: jest.Mock;

  beforeEach(() => {
    mockUploadImageAsset.mockResolvedValue('/v3/assets/channel-1/pasted.png');

    container = document.createElement('div');
    container.tabIndex = -1;
    document.body.appendChild(container);
    container.focus();

    setNodes = jest.fn();
    setEdges = jest.fn();
  });

  afterEach(() => {
    container.remove();
    jest.restoreAllMocks();
    mockUploadImageAsset.mockReset();
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
        levelName: 'test-level',
        channelId: 'channel-1',
      })
    );
  }

  it('uploads a pasted image and adds an ImageNode at the cursor', async () => {
    renderCopyPaste();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(mockUploadImageAsset).toHaveBeenCalledWith(file, {
      levelName: 'test-level',
      channelId: 'channel-1',
    });
    expect(setNodes).toHaveBeenCalledTimes(1);
    const addedNodes = setNodes.mock.calls[0][0]([]);
    expect(addedNodes).toHaveLength(1);
    expect(addedNodes[0].type).toBe('image');
    expect(addedNodes[0].data.src).toBe('/v3/assets/channel-1/pasted.png');
  });

  it('ignores a stale clipboard image when our copy marker is present', async () => {
    renderCopyPaste();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent(
      [{type: 'image/png', getAsFile: () => file}],
      INTERNAL_CLIPBOARD_MARKER
    );

    container.dispatchEvent(event);
    await flushPromises();

    // Marker present -> internal paste path; the (empty) clipboard yields no
    // nodes and no upload happens.
    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(setNodes).not.toHaveBeenCalled();
  });

  it('ignores pastes when the canvas is not focused', async () => {
    renderCopyPaste();
    container.blur();
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    document.body.dispatchEvent(event);
    await flushPromises();

    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(setNodes).not.toHaveBeenCalled();
  });

  it('does nothing in read-only mode', async () => {
    renderCopyPaste(true);
    const file = new File(['x'], 'pasted.png', {type: 'image/png'});
    const event = buildPasteEvent([{type: 'image/png', getAsFile: () => file}]);

    container.dispatchEvent(event);
    await flushPromises();

    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(setNodes).not.toHaveBeenCalled();
  });
});
