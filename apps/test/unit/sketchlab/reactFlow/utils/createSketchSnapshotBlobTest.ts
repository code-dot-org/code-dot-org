import {type ReactFlowInstance} from '@xyflow/react';
import {toBlob} from 'html-to-image';

import {
  CAPTURE_ERROR,
  createSketchSnapshotBlob,
} from '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob';
import {getCanvasBounds} from '@cdo/apps/sketchlab/reactFlow/utils/getCanvasBounds';
import {SketchCaptureError} from '@cdo/apps/sketchlab/reactFlow/utils/SketchCaptureError';

const mockMetricsReporter = {logError: jest.fn()};

jest.mock('html-to-image', () => ({toBlob: jest.fn()}));
jest.mock('@cdo/apps/sketchlab/reactFlow/utils/getCanvasBounds');
jest.mock('@cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas', () => ({
  SKETCHLAB_CONTAINER_CLASS: 'sketchlab-react-flow-container',
}));
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({getMetricsReporter: () => mockMetricsReporter}),
  },
}));

const mockToBlob = toBlob as jest.MockedFunction<typeof toBlob>;
const mockGetCanvasBounds = getCanvasBounds as jest.MockedFunction<
  typeof getCanvasBounds
>;

describe('createSketchSnapshotBlob', () => {
  const reactFlow = {
    getViewport: () => ({x: 0, y: 0, zoom: 1}),
  } as unknown as ReactFlowInstance;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="sketchlab-react-flow-container">
        <div class="react-flow">
          <div class="react-flow__viewport">
            <div class="react-flow__node"><img src="data:image/png;base64,AA"></div>
          </div>
        </div>
      </div>`;
    mockGetCanvasBounds.mockReturnValue({
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 50,
    });
    mockMetricsReporter.logError.mockClear();
  });

  it('returns the blob when capture succeeds', async () => {
    const blob = new Blob();
    mockToBlob.mockResolvedValue(blob);

    expect(await createSketchSnapshotBlob(reactFlow)).toEqual({blob});
    expect(mockMetricsReporter.logError).not.toHaveBeenCalled();
  });

  it('logs the capture details and returns a friendly error when capture throws', async () => {
    mockToBlob.mockRejectedValue(new Error('tainted canvas'));

    expect(await createSketchSnapshotBlob(reactFlow)).toEqual({
      error: CAPTURE_ERROR,
    });
    expect(mockMetricsReporter.logError).toHaveBeenCalledWith(
      'Sketch snapshot error',
      expect.any(SketchCaptureError),
      expect.objectContaining({
        reason: 'tainted canvas',
        elements: 1,
        images: 1,
      })
    );
  });
});
