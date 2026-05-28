import {type ReactFlowInstance} from '@xyflow/react';

import {DialogControlInterface, DialogType} from '@cdo/apps/lab2/views/dialogs';

import {createSketchSnapshotBlob} from './createSketchSnapshotBlob';

export const handleDownloadSketch = async (
  reactFlow: ReactFlowInstance | null,
  dialogControl: DialogControlInterface
) => {
  const {blob, error} = await createSketchSnapshotBlob(reactFlow);
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
  downloadLink.download = 'sketch.png';
  downloadLink.click();
  URL.revokeObjectURL(blobUrl);
};
