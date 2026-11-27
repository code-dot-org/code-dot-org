import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  reportShareDialogOpened,
  reportShareLinkCopied,
  reportShareMakeMyOwnClicked,
  reportSharePageVisited,
  reportShareViewCodeClicked,
  reportViewPageRemixClicked,
  shareSource,
} from '@cdo/apps/lab2/utils/shareEvents';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));
jest.mock('@cdo/apps/code-studio/utils', () => ({queryParams: jest.fn()}));
jest.mock('@cdo/apps/redux', () => ({getStore: jest.fn()}));

const sendEvent = analyticsReporter.sendEvent as jest.Mock;
const mockQueryParams = queryParams as jest.Mock;
const mockGetStore = getStore as jest.Mock;
const pageShows = (channel?: object) =>
  mockGetStore.mockReturnValue({getState: () => ({lab: {channel}})});
const project = {projectType: 'quest_builder' as const, channelId: 'abc'};

describe('shareEvents', () => {
  beforeEach(() => {
    sendEvent.mockClear();
    mockQueryParams.mockReset();
  });

  it('names the share dialog and each finish dialog as a source', () => {
    expect(shareSource()).toBe('share_dialog');
    expect(shareSource('hoai2025')).toBe('hoai2025_finish_dialog');
    expect(shareSource('hoai2026')).toBe('hoai2026_finish_dialog');
    expect(shareSource('hoc2024')).toBe('hoc2024_finish_dialog');
  });

  it('reports a dialog opening and a copied link with the project and the source', () => {
    reportShareDialogOpened(project, 'share_dialog');
    reportShareLinkCopied(project, 'hoai2026_finish_dialog');
    expect(sendEvent.mock.calls).toEqual([
      [
        'lab2-share-dialog-opened',
        {
          projectType: 'quest_builder',
          channelId: 'abc',
          source: 'share_dialog',
        },
        true,
      ],
      [
        'lab2-share-link-copied',
        {
          projectType: 'quest_builder',
          channelId: 'abc',
          source: 'hoai2026_finish_dialog',
        },
        true,
      ],
    ]);
  });

  it('reports a share page visit with whether the visitor owns the project and whether a QR code led there', () => {
    mockQueryParams.mockReturnValue(undefined);
    reportSharePageVisited(project, true);
    mockQueryParams.mockImplementation((name: string) =>
      name === 'qr' ? 'true' : undefined
    );
    reportSharePageVisited(project, false);
    expect(sendEvent.mock.calls).toEqual([
      [
        'lab2-share-page-visited',
        {
          projectType: 'quest_builder',
          channelId: 'abc',
          isOwner: true,
          fromQrCode: false,
        },
        true,
      ],
      [
        'lab2-share-page-visited',
        {
          projectType: 'quest_builder',
          channelId: 'abc',
          isOwner: false,
          fromQrCode: true,
        },
        true,
      ],
    ]);
  });

  it("reports a share page's View code and Make my own presses with the project and what Make my own opens", () => {
    pageShows({id: 'abc', projectType: 'quest_builder', isOwner: false});
    reportShareViewCodeClicked();
    reportShareMakeMyOwnClicked('new');
    pageShows({id: 'def', projectType: 'pythonlab', isOwner: true});
    reportShareMakeMyOwnClicked('remix');
    expect(sendEvent.mock.calls).toEqual([
      [
        'lab2-share-view-code-clicked',
        {projectType: 'quest_builder', channelId: 'abc', isOwner: false},
        true,
      ],
      [
        'lab2-share-make-my-own-clicked',
        {
          projectType: 'quest_builder',
          channelId: 'abc',
          isOwner: false,
          opens: 'new',
        },
        true,
      ],
      [
        'lab2-share-make-my-own-clicked',
        {
          projectType: 'pythonlab',
          channelId: 'def',
          isOwner: true,
          opens: 'remix',
        },
        true,
      ],
    ]);
  });

  it("reports a view page's Remix press with the project", () => {
    pageShows({id: 'abc', projectType: 'quest_builder', isOwner: false});
    reportViewPageRemixClicked();
    expect(sendEvent.mock.calls).toEqual([
      [
        'lab2-view-page-remix-clicked',
        {projectType: 'quest_builder', channelId: 'abc', isOwner: false},
        true,
      ],
    ]);
  });

  it('reports no press before the project has loaded', () => {
    pageShows(undefined);
    reportShareViewCodeClicked();
    reportShareMakeMyOwnClicked('remix');
    reportViewPageRemixClicked();
    expect(sendEvent).not.toHaveBeenCalled();
  });
});
