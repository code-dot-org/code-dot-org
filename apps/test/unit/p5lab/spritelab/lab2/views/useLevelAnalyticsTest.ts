import {renderHook} from '@testing-library/react-hooks';

import {LevelProperties} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {dispatchGameKey} from '@cdo/apps/p5lab/spritelab/lab2/views/playBar';
import useLevelAnalytics from '@cdo/apps/p5lab/spritelab/lab2/views/useLevelAnalytics';

const logLevelActivity = jest.fn();
jest.mock('@cdo/apps/lab2/hooks/useLevelActivityMetrics', () => ({
  useLevelActivityMetrics: () => logLevelActivity,
}));
jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: () => 'quest-builder-2026',
}));

const sendEvent = analyticsReporter.sendEvent as jest.Mock;
const level = {id: 7, name: 'set-as-player'} as unknown as LevelProperties;
const context = {
  unitName: 'quest-builder-2026',
  levelId: 7,
  levelName: 'set-as-player',
};

const visit = (
  props: {playing?: boolean; enabled?: boolean; level?: LevelProperties} = {}
) =>
  renderHook(
    (p: {playing: boolean; enabled: boolean; level: LevelProperties}) =>
      useLevelAnalytics(p.level, p.playing, p.enabled),
    {initialProps: {playing: false, enabled: true, level, ...props}}
  );
const keyboard = (key: string, init: KeyboardEventInit = {}) =>
  window.dispatchEvent(new KeyboardEvent('keydown', {key, ...init}));
const sessionEnds = () =>
  sendEvent.mock.calls.filter(
    ([name]) => name === EVENTS.HOAI2026_LEVEL_SESSION_END
  );

describe('useLevelAnalytics', () => {
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

  it('counts a game key as activity only while the game plays', () => {
    const view = visit();
    keyboard('ArrowLeft');
    expect(logLevelActivity).not.toHaveBeenCalled();
    view.rerender({playing: true, enabled: true, level});
    keyboard('a');
    expect(logLevelActivity).not.toHaveBeenCalled();
    keyboard('ArrowLeft');
    expect(logLevelActivity).toHaveBeenCalledTimes(1);
  });

  it('keeps the same functions through the visit', () => {
    const view = visit();
    const first = view.result.current;
    view.rerender({playing: true, enabled: true, level});
    expect(view.result.current.reportActivity).toBe(first.reportActivity);
    expect(view.result.current.reportCompleted).toBe(first.reportCompleted);
  });

  it('sends the completed event once, with the details and the level', () => {
    const {result} = visit();
    result.current.reportCompleted({finish: false, levelImageOrigin: 'drawn'});
    result.current.reportCompleted({finish: false, levelImageOrigin: 'drawn'});
    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenCalledWith(
      EVENTS.HOAI2026_LEVEL_COMPLETE,
      {finish: false, levelImageOrigin: 'drawn', ...context},
      true
    );
  });

  it('ends the visit with how long it took and how the game was played', () => {
    const view = visit({playing: true});
    keyboard('ArrowLeft');
    keyboard('ArrowLeft', {repeat: true});
    keyboard(' ');
    dispatchGameKey('keydown', 'up');
    view.result.current.reportCompleted({finish: false});
    jest.advanceTimersByTime(90_000);
    view.unmount();
    expect(sessionEnds()).toEqual([
      [
        EVENTS.HOAI2026_LEVEL_SESSION_END,
        {
          durationSeconds: 90,
          completed: true,
          keyboardPresses: 2,
          buttonPresses: 1,
          ...context,
        },
        true,
      ],
    ]);
  });

  it('ends the visit when the page is left, and only once', () => {
    const view = visit();
    view.result.current.reportActivity();
    window.dispatchEvent(new Event('beforeunload'));
    view.unmount();
    expect(sessionEnds()).toHaveLength(1);
    expect(sessionEnds()[0][1]).toMatchObject({completed: false});
  });

  it('sends no end for a visit with no activity', () => {
    visit().unmount();
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it('sends nothing while it is not enabled', () => {
    const view = visit({enabled: false, playing: true});
    view.result.current.reportActivity();
    keyboard('ArrowLeft');
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
