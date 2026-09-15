import {type ReactFlowInstance} from '@xyflow/react';

import {ShareFailure} from '@cdo/apps/lab2/types';
import {DialogType} from '@cdo/apps/lab2/views/dialogs';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import {createSketchSnapshotBlob} from '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob';
import {
  ABUSE_BLOCKED_MESSAGE,
  handleSaveToBackpack,
  SAVE_BLOCKED_TITLE,
} from '@cdo/apps/sketchlab/reactFlow/utils/handleSaveToBackpack';

const mockProjectManager = {flushSave: jest.fn()};
const mockLab: {
  isBlockedAbuse?: boolean;
  shareFailure: ShareFailure | null;
} = {isBlockedAbuse: false, shareFailure: null};

jest.mock('@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob');
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({getProjectManager: () => mockProjectManager}),
  },
}));
jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({getState: () => ({lab: mockLab})}),
}));
jest.mock('@cdo/apps/lab2/lab2Redux', () => ({
  waitForShareFailureRefresh: jest.fn().mockResolvedValue(undefined),
}));

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

  function runSave() {
    return handleSaveToBackpack(
      reactFlow,
      backpackApi as unknown as BackpackClientApi,
      dialogControl as never,
      [],
      errorCallback
    );
  }

  beforeEach(() => {
    showDialog = jest.fn().mockResolvedValue({type: 'confirm', args: 'sketch'});
    dialogControl = {showDialog};
    backpackApi = {saveBlobFile: jest.fn()};
    errorCallback = jest.fn();
    mockProjectManager.flushSave.mockReset();
    mockProjectManager.flushSave.mockResolvedValue(undefined);
    mockLab.isBlockedAbuse = false;
    mockLab.shareFailure = null;
    mockCreateSketchSnapshotBlob.mockReset();
    mockCreateSketchSnapshotBlob.mockResolvedValue({blob: new Blob()});
  });

  it('saves to the Backpack when the project is not flagged', async () => {
    await runSave();

    expect(mockProjectManager.flushSave).toHaveBeenCalled();
    expect(showDialog).toHaveBeenCalledWith(
      expect.objectContaining({type: DialogType.GenericPrompt})
    );
    expect(backpackApi.saveBlobFile).toHaveBeenCalled();
  });

  it('explains the abuse block and saves nothing when flagged for abuse', async () => {
    mockLab.isBlockedAbuse = true;

    await runSave();

    expect(showDialog).toHaveBeenCalledTimes(1);
    expect(showDialog).toHaveBeenCalledWith({
      type: DialogType.GenericAlert,
      title: SAVE_BLOCKED_TITLE,
      message: ABUSE_BLOCKED_MESSAGE,
    });
    expect(backpackApi.saveBlobFile).not.toHaveBeenCalled();
  });

  it('names the flagged text and saves nothing on a share failure', async () => {
    mockLab.shareFailure = {type: 'phone', content: '555-1234'};

    await runSave();

    expect(showDialog).toHaveBeenCalledTimes(1);
    const {title, message} = showDialog.mock.calls[0][0];
    expect(title).toBe(SAVE_BLOCKED_TITLE);
    expect(message).toContain('phone number');
    expect(message).toContain('555-1234');
    expect(backpackApi.saveBlobFile).not.toHaveBeenCalled();
  });

  it('reports the abuse block when both a share failure and abuse apply', async () => {
    mockLab.isBlockedAbuse = true;
    mockLab.shareFailure = {type: 'profanity'};

    await runSave();

    expect(showDialog.mock.calls[0][0].message).toBe(ABUSE_BLOCKED_MESSAGE);
  });

  it('reads the filter status the flushed save produced, not the stale one', async () => {
    // The share filter runs against the saved project, so a violation the user
    // just typed only shows up in redux once the save completes.
    mockProjectManager.flushSave.mockImplementation(async () => {
      mockLab.shareFailure = {type: 'email', content: 'me@example.com'};
    });

    await runSave();

    expect(showDialog.mock.calls[0][0].message).toContain('email address');
    expect(backpackApi.saveBlobFile).not.toHaveBeenCalled();
  });

  it('reports an error and saves nothing when the save fails', async () => {
    mockProjectManager.flushSave.mockRejectedValue(new Error('network down'));

    await runSave();

    expect(errorCallback).toHaveBeenCalledWith(expect.stringContaining('save'));
    expect(showDialog).not.toHaveBeenCalled();
    expect(backpackApi.saveBlobFile).not.toHaveBeenCalled();
  });
});
