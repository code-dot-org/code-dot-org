import {renderHook} from '@testing-library/react-hooks';

import {useLevelSessionMetrics} from '@cdo/apps/lab2/hooks/useLevelSessionMetrics';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

const logLevelActivity = jest.fn();
jest.mock('@cdo/apps/lab2/hooks/useLevelActivityMetrics', () => ({
  useLevelActivityMetrics: () => logLevelActivity,
}));
jest.mock('@cdo/apps/lab2/utils', () => ({
  sendLab2AnalyticsEvent: jest.fn(),
}));
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: () => 'quest-builder-2026',
}));

const sendEvent = sendLab2AnalyticsEvent as jest.Mock;
const level = {id: 7, name: 'set-as-player'} as unknown as LevelProperties;
const nextLevel = {id: 8, name: 'add-a-prize'} as unknown as LevelProperties;
const context = {
  unitName: 'quest-builder-2026',
  levelId: 7,
  levelName: 'set-as-player',
};

interface Props {
  level: LevelProperties;
  enabled?: boolean;
}
const visit = (props: Partial<Props> = {}) =>
  renderHook(
    (p: Props) =>
      useLevelSessionMetrics(p.level, {
        enabled: p.enabled,
        getSessionDetails: () => ({hints: 2}),
      }),
    {initialProps: {level, ...props}}
  );
const sessionEnds = () =>
  sendEvent.mock.calls.filter(([name]) => name === EVENTS.LEVEL_SESSION_END);

describe('useLevelSessionMetrics', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-19T12:00:00Z'));
    logLevelActivity.mockClear();
    sendEvent.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  it('logs level activity when told the student acted', () => {
    const {result} = visit();
    expect(logLevelActivity).not.toHaveBeenCalled();
    result.current.reportActivity();
    expect(logLevelActivity).toHaveBeenCalledTimes(1);
  });

  it('keeps the same functions through the visit', () => {
    const view = visit();
    const first = view.result.current;
    view.rerender({level, enabled: true});
    expect(view.result.current.reportActivity).toBe(first.reportActivity);
    expect(view.result.current.reportCompleted).toBe(first.reportCompleted);
  });

  it('sends the completed event once, with the details and the level', () => {
    const {result} = visit();
    result.current.reportCompleted({finish: false});
    result.current.reportCompleted({finish: false});
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith(EVENTS.LEVEL_COMPLETED, {
      finish: false,
      ...context,
    });
  });

  it('ends the visit with its length, completion and the lab details', () => {
    const view = visit();
    view.result.current.reportActivity();
    view.result.current.reportCompleted();
    jest.advanceTimersByTime(90_000);
    view.unmount();
    expect(sessionEnds()).toEqual([
      [
        EVENTS.LEVEL_SESSION_END,
        {hints: 2, durationSeconds: 90, completed: true, ...context},
      ],
    ]);
  });

  it.each(['beforeunload', 'pagehide'])(
    'ends the visit on %s, and only once',
    eventName => {
      const view = visit();
      view.result.current.reportActivity();
      window.dispatchEvent(new Event(eventName));
      view.unmount();
      expect(sessionEnds()).toHaveLength(1);
      expect(sessionEnds()[0][1]).toMatchObject({completed: false});
    }
  );

  it('ends the visit when the level changes, and starts another', () => {
    const view = visit();
    view.result.current.reportActivity();
    view.result.current.reportCompleted();
    jest.advanceTimersByTime(30_000);
    view.rerender({level: nextLevel});
    expect(sessionEnds()).toHaveLength(1);
    expect(sessionEnds()[0][1]).toMatchObject({
      levelId: 7,
      durationSeconds: 30,
      completed: true,
    });

    view.result.current.reportActivity();
    jest.advanceTimersByTime(10_000);
    view.unmount();
    expect(sessionEnds()).toHaveLength(2);
    expect(sessionEnds()[1][1]).toMatchObject({
      levelId: 8,
      levelName: 'add-a-prize',
      durationSeconds: 10,
      completed: false,
    });
  });

  it('sends no end for a visit with no activity', () => {
    visit().unmount();
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it('sends nothing while it is not enabled', () => {
    const view = visit({enabled: false});
    view.result.current.reportActivity();
    view.result.current.reportCompleted({finish: true});
    view.unmount();
    expect(logLevelActivity).not.toHaveBeenCalled();
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it('sends nothing for a standalone project', () => {
    const project = {...level, isProjectLevel: true} as LevelProperties;
    const view = visit({level: project});
    view.result.current.reportActivity();
    view.result.current.reportCompleted({finish: true});
    view.unmount();
    expect(logLevelActivity).not.toHaveBeenCalled();
    expect(sendEvent).not.toHaveBeenCalled();
  });
});
