import {type ReactFlowInstance} from '@xyflow/react';

import {DialogType} from '@cdo/apps/lab2/views/dialogs';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import {createSketchSnapshotBlob} from '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob';
import {
  ABUSE_BLOCKED_MESSAGE,
  handleSaveToBackpack,
  SAVE_BLOCKED_TITLE,
} from '@cdo/apps/sketchlab/reactFlow/utils/handleSaveToBackpack';

jest.mock('@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob');

const mockCreateSketchSnapshotBlob =
  createSketchSnapshotBlob as jest.MockedFunction<
    typeof createSketchSnapshotBlob
  >;

describe('handleSaveToBackpack', () => {
  const reactFlow = {} as ReactFlowInstance;
  let showDialog: jest.Mock;
  let dialogControl: {showDialog: jest.Mock};
  let backpackApi: {saveBlobFile: jest.Mock};
  let errorCallback: jest.Mock;

  function runSave(
    moderationState: Parameters<typeof handleSaveToBackpack>[5]
  ) {
    return handleSaveToBackpack(
      reactFlow,
      backpackApi as unknown as BackpackClientApi,
      dialogControl as never,
      [],
      errorCallback,
      moderationState
    );
  }

  beforeEach(() => {
    showDialog = jest.fn().mockResolvedValue({type: 'confirm', args: 'sketch'});
    dialogControl = {showDialog};
    backpackApi = {saveBlobFile: jest.fn()};
    errorCallback = jest.fn();
    mockCreateSketchSnapshotBlob.mockReset();
    mockCreateSketchSnapshotBlob.mockResolvedValue({blob: new Blob()});
  });

  it('saves to the Backpack when the project is not flagged', async () => {
    await runSave({isBlockedAbuse: false, shareFailure: null});

    expect(showDialog).toHaveBeenCalledWith(
      expect.objectContaining({type: DialogType.GenericPrompt})
    );
    expect(backpackApi.saveBlobFile).toHaveBeenCalled();
  });

  it('explains the abuse block and saves nothing when flagged for abuse', async () => {
    await runSave({isBlockedAbuse: true, shareFailure: null});

    expect(showDialog).toHaveBeenCalledTimes(1);
    expect(showDialog).toHaveBeenCalledWith({
      type: DialogType.GenericAlert,
      title: SAVE_BLOCKED_TITLE,
      message: ABUSE_BLOCKED_MESSAGE,
    });
    expect(backpackApi.saveBlobFile).not.toHaveBeenCalled();
  });

  it('names the flagged text and saves nothing on a share failure', async () => {
    await runSave({
      isBlockedAbuse: false,
      shareFailure: {type: 'phone', content: '555-1234'},
    });

    expect(showDialog).toHaveBeenCalledTimes(1);
    const {title, message} = showDialog.mock.calls[0][0];
    expect(title).toBe(SAVE_BLOCKED_TITLE);
    expect(message).toContain('phone number');
    expect(message).toContain('555-1234');
    expect(backpackApi.saveBlobFile).not.toHaveBeenCalled();
  });

  it('reports the abuse block when both a share failure and abuse apply', async () => {
    await runSave({
      isBlockedAbuse: true,
      shareFailure: {type: 'profanity'},
    });

    expect(showDialog.mock.calls[0][0].message).toBe(ABUSE_BLOCKED_MESSAGE);
  });
});
