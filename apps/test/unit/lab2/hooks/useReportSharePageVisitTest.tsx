import {renderHook} from '@testing-library/react-hooks';

import useReportSharePageVisit from '@cdo/apps/lab2/hooks/useReportSharePageVisit';
import {reportSharePageVisited} from '@cdo/apps/lab2/utils/shareEvents';

jest.mock('@cdo/apps/lab2/utils/shareEvents', () => ({
  reportSharePageVisited: jest.fn(),
}));

let mockLab: {
  isShareView?: boolean;
  channel?: {id: string; projectType: string; isOwner: boolean};
};
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({lab: mockLab}),
}));

const report = reportSharePageVisited as jest.Mock;
const channel = {id: 'abc', projectType: 'quest_builder', isOwner: false};

describe('useReportSharePageVisit', () => {
  beforeEach(() => report.mockClear());

  it('reports one visit once a share page has its project', () => {
    mockLab = {isShareView: true};
    const {rerender} = renderHook(() => useReportSharePageVisit());
    expect(report).not.toHaveBeenCalled();
    mockLab = {isShareView: true, channel};
    rerender();
    mockLab = {isShareView: true, channel: {...channel, isOwner: true}};
    rerender();
    expect(report.mock.calls).toEqual([
      [{projectType: 'quest_builder', channelId: 'abc'}, false],
    ]);
  });

  it('reports that the visitor owns the project', () => {
    mockLab = {isShareView: true, channel: {...channel, isOwner: true}};
    renderHook(() => useReportSharePageVisit());
    expect(report).toHaveBeenCalledWith(
      {projectType: 'quest_builder', channelId: 'abc'},
      true
    );
  });

  it('reports nothing on a page that is not a share page', () => {
    mockLab = {isShareView: false, channel};
    renderHook(() => useReportSharePageVisit());
    expect(report).not.toHaveBeenCalled();
  });
});
