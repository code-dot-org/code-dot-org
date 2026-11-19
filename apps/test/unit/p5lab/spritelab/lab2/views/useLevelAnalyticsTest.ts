import {renderHook} from '@testing-library/react-hooks';

import {LevelProperties} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {dispatchGameKey} from '@cdo/apps/p5lab/spritelab/lab2/views/playBar';
import useLevelAnalytics from '@cdo/apps/p5lab/spritelab/lab2/views/useLevelAnalytics';

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

interface Props {
  playing: boolean;
  enabled: boolean;
  level: LevelProperties;
}
const visit = (props: Partial<Props> = {}) =>
  renderHook((p: Props) => useLevelAnalytics(p.level, p.playing, p.enabled), {
    initialProps: {playing: false, enabled: true, level, ...props},
  });
const keyboard = (key: string, init: KeyboardEventInit = {}) =>
  window.dispatchEvent(new KeyboardEvent('keydown', {key, ...init}));
const sessionEnds = () =>
  sendEvent.mock.calls.filter(([name]) => name === EVENTS.LEVEL_SESSION_END);

describe('useLevelAnalytics', () => {
  beforeEach(() => {
    logLevelActivity.mockClear();
    sendEvent.mockClear();
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

  it('ends the visit with how the game was played', () => {
    const view = visit({playing: true});
    keyboard('ArrowLeft');
    keyboard('ArrowLeft', {repeat: true});
    keyboard(' ');
    dispatchGameKey('keydown', 'up');
    view.unmount();
    expect(sessionEnds()).toHaveLength(1);
    expect(sessionEnds()[0][1]).toMatchObject({
      keyboardPressesWhilePlaying: 2,
      buttonPressesWhilePlaying: 1,
      levelId: 7,
    });
  });

  it('starts the counts again on the next level', () => {
    const view = visit({playing: true});
    keyboard('ArrowLeft');
    view.rerender({playing: true, enabled: true, level: nextLevel});
    dispatchGameKey('keydown', 'up');
    view.unmount();
    expect(sessionEnds().map(([, payload]) => payload)).toMatchObject([
      {
        levelId: 7,
        keyboardPressesWhilePlaying: 1,
        buttonPressesWhilePlaying: 0,
      },
      {
        levelId: 8,
        keyboardPressesWhilePlaying: 0,
        buttonPressesWhilePlaying: 1,
      },
    ]);
  });

  it('sends nothing while it is not enabled', () => {
    const view = visit({enabled: false, playing: true});
    keyboard('ArrowLeft');
    view.unmount();
    expect(logLevelActivity).not.toHaveBeenCalled();
    expect(sendEvent).not.toHaveBeenCalled();
  });
});
