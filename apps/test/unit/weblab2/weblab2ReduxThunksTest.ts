import {acceptAiTutorVersion} from '@cdo/apps/weblab2/weblab2ReduxThunks';

const mockSetAndSaveProjectSources = jest.fn();
jest.mock('@cdo/apps/lab2/redux/lab2ProjectReduxThunks', () => ({
  setAndSaveProjectSources: (...args: unknown[]) => {
    mockSetAndSaveProjectSources(...args);
    return {type: 'test/setAndSaveProjectSources'};
  },
}));
jest.mock('@cdo/apps/aichat/redux/thunks/addChatEvent', () => ({
  addChatEvent: () => ({type: 'test/addChatEvent'}),
}));
jest.mock('@cdo/apps/lab2/utils', () => ({sendLab2AnalyticsEvent: jest.fn()}));
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  getInstance: () => ({
    getProjectManager: () => undefined,
    getMetricsReporter: () => ({logError: jest.fn()}),
  }),
}));

const file = {id: '1', name: 'main.py', contents: 'new', folderId: '0'};
const labConfig = {miniApp: {name: 'neighborhood'}};

describe('acceptAiTutorVersion', () => {
  it('keeps labConfig in both saved versions', async () => {
    const state = {
      lab: {channel: {id: 'channel'}},
      lab2Project: {
        projectSources: {
          source: {files: {'1': {...file, isAiTutorVersionUpdated: true}}},
          labConfig,
        },
        projectSourceBeforeAiTutorVersion: {
          files: {'1': {...file, contents: 'old'}},
        },
      },
    };

    await acceptAiTutorVersion({files: [file], commitDescription: 'x'})(
      jest.fn(),
      () => state as never,
      undefined
    );

    const saved = mockSetAndSaveProjectSources.mock.calls.map(([s]) => s);
    expect(saved).toHaveLength(2);
    expect(saved[0]).toMatchObject({
      labConfig,
      source: state.lab2Project.projectSourceBeforeAiTutorVersion,
    });
    expect(saved[1].labConfig).toEqual(labConfig);
    expect(saved[1].source.files['1'].isAiTutorVersionUpdated).toBe(false);
  });
});
