import {findOrCreateStableId} from '@cdo/apps/metrics/statsigHelpers';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

jest.mock('@cdo/apps/metrics/statsigHelpers', () => ({
  findOrCreateStableId: jest.fn(),
}));
jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  sendEvent: jest.fn(),
}));
jest.mock('@cdo/apps/redux', () => ({getStore: jest.fn()}));
jest.mock(
  '@cdo/apps/templates/policy_compliance/ParentalPermissionModal',
  () => () => null
);
jest.mock('@cdo/apps/util/createReactRoot', () => ({
  createReactRoot: jest.fn(),
}));
jest.mock('@cdo/apps/util/getScriptData', () => jest.fn());
jest.mock('@cdo/apps/utils', () => ({
  tryGetLocalStorage: jest.fn(),
  trySetLocalStorage: jest.fn(),
}));

describe('parental permission modal initialization', () => {
  let onReady;

  beforeAll(() => {
    const listener = jest
      .spyOn(document, 'addEventListener')
      .mockImplementation((event, callback) => {
        if (event === 'DOMContentLoaded') onReady = callback;
      });
    require('@cdo/apps/sites/studio/pages/policy_compliance/parental_permission/_modal');
    listener.mockRestore();
  });

  beforeEach(() => {
    getScriptData.mockReturnValue(false);
    tryGetLocalStorage.mockReturnValue('');
  });

  it('waits for the ID before using the modal storage key', async () => {
    let resolveId;
    findOrCreateStableId.mockReturnValue(
      new Promise(resolve => {
        resolveId = resolve;
      })
    );
    const pending = onReady();
    expect(tryGetLocalStorage).not.toHaveBeenCalled();
    expect(createReactRoot).not.toHaveBeenCalled();
    resolveId('server-id');
    await pending;
    expect(tryGetLocalStorage).toHaveBeenCalledWith(
      'cap-ppm-last-shown-at-server-id',
      ''
    );
    expect(trySetLocalStorage).toHaveBeenCalledWith(
      'cap-ppm-last-shown-at-server-id',
      expect.any(String)
    );
    expect(createReactRoot).toHaveBeenCalledTimes(1);
  });

  it('does not delay forced display for a stable ID', async () => {
    getScriptData.mockImplementation(key => key === 'forceDisplay');
    await onReady();
    expect(findOrCreateStableId).not.toHaveBeenCalled();
    expect(createReactRoot).toHaveBeenCalledTimes(1);
  });

  it('still suppresses the modal if it was shown recently', async () => {
    findOrCreateStableId.mockResolvedValue('server-id');
    tryGetLocalStorage.mockReturnValue(new Date().toISOString());
    await onReady();
    expect(createReactRoot).not.toHaveBeenCalled();
    expect(trySetLocalStorage).not.toHaveBeenCalled();
  });
});
