import {type ReactFlowInstance} from '@xyflow/react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {DialogControlInterface, DialogType} from '@cdo/apps/lab2/views/dialogs';

import {createSketchSnapshotBlob} from './createSketchSnapshotBlob';

export const handleDownloadSketch = async (
  reactFlow: ReactFlowInstance | null,
  dialogControl: DialogControlInterface
) => {
  let snapshot: {blob?: Blob; error?: string};
  try {
    snapshot = await createSketchSnapshotBlob(reactFlow);
  } catch (caught) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Sketch snapshot error', caught as Error);
    snapshot = {error: 'Could not capture your sketch. Please try again.'};
  }
  const {blob, error} = snapshot;
  if (error || !blob) {
    await dialogControl.showDialog({
      type: DialogType.GenericAlert,
      title: 'Unable to download sketch',
      message: error ?? 'Could not capture your sketch. Please try again.',
    });
    return;
  }

  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = `sketch_${Date.now()}.png`;
  downloadLink.click();
  URL.revokeObjectURL(blobUrl);
};
