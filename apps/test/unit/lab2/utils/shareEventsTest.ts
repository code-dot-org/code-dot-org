import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  reportShareDialogOpened,
  reportShareLinkCopied,
  reportSharePageVisited,
  shareSource,
} from '@cdo/apps/lab2/utils/shareEvents';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));
jest.mock('@cdo/apps/code-studio/utils', () => ({queryParams: jest.fn()}));

const sendEvent = analyticsReporter.sendEvent as jest.Mock;
const mockQueryParams = queryParams as jest.Mock;
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
});
