import {type ReactFlowInstance} from '@xyflow/react';

import {ShareFailure} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import type UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';
import {createSketchSnapshotBlob} from '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob';
import {
  ABUSE_BLOCKED_MESSAGE,
  handleSaveToBackpack,
  SAVE_BLOCKED_TITLE,
} from '@cdo/apps/sketchlab/reactFlow/utils/handleSaveToBackpack';

const mockProjectManager = {flushSave: jest.fn()};
const mockMetricsReporter = {logError: jest.fn()};
const mockLab: {
  isBlockedAbuse?: boolean;
  shareFailure: ShareFailure | null;
} = {isBlockedAbuse: false, shareFailure: null};

jest.mock('@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob');
jest.mock('@cdo/apps/lab2/utils', () => ({sendLab2AnalyticsEvent: jest.fn()}));
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getProjectManager: () => mockProjectManager,
      getMetricsReporter: () => mockMetricsReporter,
    }),
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
const mockSendLab2AnalyticsEvent =
  sendLab2AnalyticsEvent as jest.MockedFunction<typeof sendLab2AnalyticsEvent>;

// Stand-in for BackpackClientApi.saveBlobFile, which reports through callbacks.
const saveBlobFileMock = (succeeds: boolean) =>
  jest.fn(
    (
      filename: string,
      blob: Blob,
      onError: (error?: Error) => void,
      onSuccess: () => void
    ) => (succeeds ? onSuccess() : onError(new Error('upload failed')))
  );

describe('handleSaveToBackpack', () => {
  const reactFlow = {} as ReactFlowInstance;
  let showDialog: jest.Mock;
  let dialogControl: {showDialog: jest.Mock};
  let backpackApi: {appType: string; saveBlobFile: jest.Mock};
  let errorCallback: jest.Mock;

  function runSave(backpackFileList: string[] = []) {
    return handleSaveToBackpack(
      reactFlow,
      backpackApi as unknown as BackpackClientApi,
      dialogControl as never,
      backpackFileList,
      errorCallback
    );
  }

  beforeEach(() => {
    showDialog = jest.fn().mockResolvedValue({type: 'confirm', args: 'sketch'});
    dialogControl = {showDialog};
    backpackApi = {appType: 'sketchlab', saveBlobFile: saveBlobFileMock(true)};
    errorCallback = jest.fn();
    mockSendLab2AnalyticsEvent.mockReset();
    mockMetricsReporter.logError.mockReset();
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

  it('treats a name already in the backpack as a replacement', async () => {
    await runSave(['sketch.png']);

    expect(mockSendLab2AnalyticsEvent).toHaveBeenCalledWith(
      EVENTS.SAVE_TO_BACKPACK_REPLACE,
      {fileType: 'png'}
    );
  });

  describe('with the unified backpack', () => {
    let unifiedApi: {
      getFileLists: jest.Mock;
      deleteFromLegacyBackpacks: jest.Mock;
      saveBlobFile: jest.Mock;
    };

    function runUnifiedSave() {
      return handleSaveToBackpack(
        reactFlow,
        unifiedApi as unknown as UnifiedBackpackClientApi,
        dialogControl as never,
        [],
        errorCallback
      );
    }

    beforeEach(() => {
      unifiedApi = {
        getFileLists: jest.fn().mockResolvedValue({}),
        deleteFromLegacyBackpacks: jest.fn().mockResolvedValue(undefined),
        saveBlobFile: saveBlobFileMock(true),
      };
    });

    it('saves without touching the legacy backpacks when the name is new', async () => {
      await runUnifiedSave();

      expect(unifiedApi.saveBlobFile).toHaveBeenCalled();
      expect(unifiedApi.deleteFromLegacyBackpacks).not.toHaveBeenCalled();
      expect(mockSendLab2AnalyticsEvent).toHaveBeenCalledWith(
        EVENTS.SAVE_TO_BACKPACK_NEW,
        {fileType: 'png'}
      );
    });

    it('treats a name held only by another lab as a duplicate, and clears it', async () => {
      unifiedApi.getFileLists.mockResolvedValue({aichat: ['sketch.png']});

      await runUnifiedSave();

      expect(showDialog.mock.calls[0][0].validateInput('sketch')).toEqual({
        type: 'warning',
        text: 'A file with this name already exists in your Backpack.',
      });
      expect(mockSendLab2AnalyticsEvent).toHaveBeenCalledWith(
        EVENTS.SAVE_TO_BACKPACK_REPLACE,
        {fileType: 'png'}
      );
      expect(unifiedApi.deleteFromLegacyBackpacks).toHaveBeenCalledWith(
        'sketch.png',
        {aichat: ['sketch.png']}
      );
    });

    it('leaves the legacy backpacks alone when the save fails', async () => {
      unifiedApi.getFileLists.mockResolvedValue({aichat: ['sketch.png']});
      unifiedApi.saveBlobFile = saveBlobFileMock(false);

      await runUnifiedSave();

      expect(errorCallback).toHaveBeenCalledWith(
        expect.stringContaining('sketch.png')
      );
      expect(unifiedApi.deleteFromLegacyBackpacks).not.toHaveBeenCalled();
    });

    it('keeps the save and reports the failure when clearing the old copy fails', async () => {
      unifiedApi.getFileLists.mockResolvedValue({aichat: ['sketch.png']});
      unifiedApi.deleteFromLegacyBackpacks.mockRejectedValue(
        new Error('delete failed')
      );

      await runUnifiedSave();

      expect(unifiedApi.saveBlobFile).toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalledWith(
        expect.stringContaining("couldn't delete your old file")
      );
      expect(mockMetricsReporter.logError).toHaveBeenCalledWith(
        'Backpack duplicate delete error',
        expect.any(Error)
      );
    });

    it('saves nothing when the backpack file lists cannot be read', async () => {
      unifiedApi.getFileLists.mockRejectedValue(new Error('network down'));

      await runUnifiedSave();

      expect(errorCallback).toHaveBeenCalledWith(
        expect.stringContaining('Could not read your Backpack')
      );
      expect(showDialog).not.toHaveBeenCalled();
      expect(unifiedApi.saveBlobFile).not.toHaveBeenCalled();
    });
  });
});
