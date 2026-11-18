import {renderHook} from '@testing-library/react-hooks';

import {LevelProperties} from '@cdo/apps/lab2/types';
import useReportLevelActivity from '@cdo/apps/p5lab/spritelab/lab2/views/useReportLevelActivity';

const mockLogLevelActivity = jest.fn();
jest.mock('@cdo/apps/lab2/hooks/useLevelActivityMetrics', () => ({
  useLevelActivityMetrics: () => mockLogLevelActivity,
}));

const level = (id: number) => ({id} as LevelProperties);

const render = (playing = false) =>
  renderHook(
    ({
      level: levelProperties,
      playing,
    }: {
      level: LevelProperties;
      playing: boolean;
    }) => useReportLevelActivity(levelProperties, playing),
    {initialProps: {level: level(1), playing}}
  );

const press = (key: string) =>
  window.dispatchEvent(new KeyboardEvent('keydown', {key}));

describe('useReportLevelActivity', () => {
  beforeEach(() => mockLogLevelActivity.mockClear());

  it('reports nothing until the student acts', () => {
    render();
    expect(mockLogLevelActivity).not.toHaveBeenCalled();
  });

  it('reports a game key while the game plays', () => {
    render(true);
    press('a');
    expect(mockLogLevelActivity).not.toHaveBeenCalled();
    press('ArrowRight');
    expect(mockLogLevelActivity).toHaveBeenCalledTimes(1);
  });

  it('does not report a game key while the game is stopped', () => {
    const {rerender} = render(true);
    rerender({level: level(1), playing: false});
    press('ArrowRight');
    expect(mockLogLevelActivity).not.toHaveBeenCalled();
  });

  it('reports when the returned function is called', () => {
    const {result} = render();
    result.current();
    expect(mockLogLevelActivity).toHaveBeenCalledTimes(1);
  });

  it('returns the same function on a later level', () => {
    const {result, rerender} = render();
    const first = result.current;
    rerender({level: level(2), playing: false});
    expect(result.current).toBe(first);
  });
});
