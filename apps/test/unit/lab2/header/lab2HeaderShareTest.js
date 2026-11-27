import {shareLab2Project} from '@cdo/apps/lab2/header/lab2HeaderShare';
import {reportShareDialogOpened} from '@cdo/apps/lab2/utils/shareEvents';

let mockProjectManager;
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({getProjectManager: () => mockProjectManager}),
  },
}));
jest.mock('@cdo/apps/lab2/lab2Redux', () => ({
  waitForShareFailureRefresh: jest.fn(() => Promise.resolve()),
}));
jest.mock('@cdo/apps/lab2/views/Lab2ShareDialogWrapper', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@cdo/apps/util/createReactRoot', () => ({
  createReactRoot: jest.fn(),
}));
jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({dispatch: jest.fn()}),
}));
jest.mock('@cdo/apps/util/trackEvent', () => jest.fn());
jest.mock('@cdo/apps/lab2/utils/shareEvents', () => ({
  ...jest.requireActual('@cdo/apps/lab2/utils/shareEvents'),
  reportShareDialogOpened: jest.fn(),
}));

const makeProjectManager = projectType => ({
  getShareUrl: () => 'https://studio.code.org/projects/quest_builder/abc',
  flushSave: jest.fn(() => Promise.resolve()),
  getProjectType: () => projectType,
  getChannelId: () => 'abc',
});

// The dialog opens only after two promises resolve, the save and then the
// share check. A timer gives both time to finish.
const opened = () => new Promise(resolve => setTimeout(resolve));

describe('shareLab2Project', () => {
  beforeEach(() => reportShareDialogOpened.mockClear());

  it("reports the Share button's dialog opening", async () => {
    mockProjectManager = makeProjectManager('quest_builder');
    shareLab2Project();
    await opened();
    expect(mockProjectManager.flushSave).toHaveBeenCalled();
    expect(reportShareDialogOpened.mock.calls).toEqual([
      [{projectType: 'quest_builder', channelId: 'abc'}, 'share_dialog'],
    ]);
  });

  it('reports a finish dialog opening with its own source', async () => {
    mockProjectManager = makeProjectManager('quest_builder');
    shareLab2Project('hoai2026', '/congrats');
    await opened();
    expect(reportShareDialogOpened.mock.calls).toEqual([
      [
        {projectType: 'quest_builder', channelId: 'abc'},
        'hoai2026_finish_dialog',
      ],
    ]);
  });

  it('reports nothing for a project that has not loaded', async () => {
    mockProjectManager = makeProjectManager(undefined);
    shareLab2Project();
    await opened();
    expect(reportShareDialogOpened).not.toHaveBeenCalled();
  });
});
