import {act, renderHook} from '@testing-library/react-hooks';

import {Tab} from '@cdo/apps/p5lab/spritelab/lab2/redux/spriteLab2Redux';
import useTabFade, {
  TAB_FADE_MS,
} from '@cdo/apps/p5lab/spritelab/lab2/views/useTabFade';

describe('useTabFade', () => {
  const editor = () => {
    const element = document.createElement('div');
    element.animate = jest.fn();
    return element;
  };
  const show = (tab: Tab, editors: Parameters<typeof useTabFade>[1]) =>
    renderHook((props: {tab: Tab}) => useTabFade(props.tab, editors), {
      initialProps: {tab},
    });

  it('fades an editor in as its tab comes up, not on arrival', () => {
    const code = {current: editor()};
    const world = {current: editor()};
    const view = show('Code', {Code: code, World: world});
    expect(code.current.animate).not.toHaveBeenCalled();
    view.rerender({tab: 'World'});
    expect(world.current.animate).toHaveBeenCalledWith(
      [{opacity: 0}, {opacity: 1}],
      expect.objectContaining({duration: TAB_FADE_MS})
    );
    expect(code.current.animate).not.toHaveBeenCalled();
  });

  it('leaves a tab with no editor alone', () => {
    const code = {current: editor()};
    const view = show('Code', {Code: code});
    view.rerender({tab: 'Play'});
    view.rerender({tab: 'Code'});
    expect(code.current.animate).toHaveBeenCalledTimes(1);
  });

  it('fades an editor that mounts after its tab came up, once', () => {
    const code = {current: editor()};
    const world = {current: null as HTMLElement | null};
    const view = show('Code', {Code: code, World: world});
    view.rerender({tab: 'World'});
    const mounted = editor();
    act(() => view.result.current.ref('World')(mounted));
    expect(world.current).toBe(mounted);
    expect(mounted.animate).toHaveBeenCalledTimes(1);
    act(() => view.result.current.ref('World')(null));
    act(() => view.result.current.ref('World')(mounted));
    expect(world.current).toBe(mounted);
    expect(mounted.animate).toHaveBeenCalledTimes(1);
  });

  it('never fades an editor mounting on arrival', () => {
    const world = {current: null as HTMLElement | null};
    const view = show('World', {World: world});
    const mounted = editor();
    act(() => view.result.current.ref('World')(mounted));
    expect(mounted.animate).not.toHaveBeenCalled();
  });

  it('hands out one ref per tab', () => {
    const view = show('Code', {});
    expect(view.result.current.ref('World')).toBe(
      view.result.current.ref('World')
    );
  });
});
