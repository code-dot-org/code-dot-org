import {fetchAndSaveFile} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/saveToBackpackHelper';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  getInstance: () => ({
    getMetricsReporter: () => ({logError: jest.fn()}),
  }),
}));

jest.mock('@cdo/apps/lab2/utils', () => ({
  sendLab2AnalyticsEvent: jest.fn(),
}));

jest.mock('@cdo/apps/utils', () => ({
  createUuid: () => 'test-uuid',
}));

const CHANNEL_ID = 'test-channel';

// The helper only reads headers and the body, so a minimal stand-in is enough.
const responseWith = (contentType: string, body: string) =>
  ({
    headers: {get: () => contentType},
    blob: async () => new Blob([body], {type: contentType}),
    text: async () => body,
  } as unknown as Response);

describe('fetchAndSaveFile', () => {
  let createNewFile: jest.Mock;
  let saveFile: jest.Mock;
  let addAlert: jest.Mock;
  let put: jest.SpyInstance;

  const runImport = (response: Response, fileName: string) =>
    fetchAndSaveFile({
      successMetric: 'test-metric',
      backpackApi: {
        fetchFileResponse: async () => response,
      } as unknown as BackpackClientApi,
      channelId: CHANNEL_ID,
      addAlert,
      saveFile,
      createNewFile,
      findIdForFileName: () => 'file-id',
      selectedFileName: fileName,
      newFileName: fileName,
    });

  beforeEach(() => {
    createNewFile = jest.fn();
    saveFile = jest.fn();
    addAlert = jest.fn();
    put = jest.spyOn(HttpClient, 'put').mockResolvedValue({} as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uploads audio as a channel asset and saves the file with a url', async () => {
    await runImport(responseWith('audio/x-wav', 'RIFF...'), 'beep.wav');

    expect(put).toHaveBeenCalledWith(
      `/v3/assets/${CHANNEL_ID}/test-uuid.wav`,
      expect.any(Blob)
    );
    expect(createNewFile).toHaveBeenCalledWith(
      'beep.wav',
      '',
      `/v3/assets/${CHANNEL_ID}/test-uuid.wav`
    );
    expect(addAlert).toHaveBeenCalledWith('success', expect.any(String));
  });

  it('uploads images as a channel asset', async () => {
    await runImport(responseWith('image/png', 'PNG...'), 'cat.png');

    expect(put).toHaveBeenCalledWith(
      `/v3/assets/${CHANNEL_ID}/test-uuid.png`,
      expect.any(Blob)
    );
    expect(createNewFile).toHaveBeenCalledWith(
      'cat.png',
      '',
      `/v3/assets/${CHANNEL_ID}/test-uuid.png`
    );
  });

  it('saves text files as contents with no url', async () => {
    await runImport(responseWith('text/plain', 'print(1)'), 'main.py');

    expect(put).not.toHaveBeenCalled();
    expect(createNewFile).toHaveBeenCalledWith(
      'main.py',
      'print(1)',
      undefined
    );
  });
});
