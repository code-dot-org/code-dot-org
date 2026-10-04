import {
  easeOut,
  SCROLL_MS,
  scrollDelta,
  scrollIntoView,
} from '@cdo/apps/p5lab/spritelab/lab2/scrollIntoView';

const VIEW = {left: 0, top: 0, width: 400, height: 300};

// A workspace as the scroll reads and drives it. `scrolls` records every
// offset set.
function fakeWorkspace(view = VIEW, scale = 1) {
  const div = document.createElement('div');
  const scrolls: [number, number][] = [];
  const workspace = {
    scrollX: 0,
    scrollY: 0,
    dragging: false,
    rendered: true,
    isMovable: () => true,
    isDragging: () => workspace.dragging,
    getScale: () => scale,
    getMetricsManager: () => ({getViewMetrics: () => view}),
    getInjectionDiv: () => div,
    scroll(x: number, y: number) {
      workspace.scrollX = x;
      workspace.scrollY = y;
      scrolls.push([x, y]);
    },
  };
  return {workspace, div, scrolls};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asWorkspace = (w: unknown) => w as any;

describe('scrollIntoView', () => {
  describe('scrollDelta', () => {
    it('does not move for a box already in view', () => {
      expect(
        scrollDelta({left: 10, top: 10, right: 100, bottom: 100}, VIEW, 1, 24)
      ).toEqual({dx: 0, dy: 0});
    });

    it('scrolls up by what a box below the fold needs, plus padding', () => {
      // Bottom edge 600 against a view ending at 300: 300 past, 24 more.
      expect(
        scrollDelta({left: 50, top: 500, right: 100, bottom: 600}, VIEW, 1, 24)
      ).toEqual({dx: 0, dy: -324});
    });

    it('scrolls down for a box above the view', () => {
      expect(
        scrollDelta({left: 50, top: -50, right: 100, bottom: 20}, VIEW, 1, 10)
      ).toEqual({dx: 0, dy: 60});
    });

    it('shows the top left of a box bigger than the view', () => {
      const {dx, dy} = scrollDelta(
        {left: -20, top: -20, right: 1000, bottom: 1000},
        VIEW,
        1,
        0
      );
      expect(dx).toBe(20);
      expect(dy).toBe(20);
    });

    it('a vertical scroll leaves a box off to the side where it is', () => {
      expect(
        scrollDelta(
          {left: -20, top: 500, right: 100, bottom: 600},
          VIEW,
          1,
          24,
          'vertical'
        )
      ).toEqual({dx: 0, dy: -324});
      expect(
        scrollDelta(
          {left: 500, top: 10, right: 600, bottom: 100},
          VIEW,
          1,
          24,
          'vertical'
        )
      ).toEqual({dx: 0, dy: 0});
    });

    it('scales workspace units to pixels', () => {
      expect(
        scrollDelta({left: 0, top: 500, right: 100, bottom: 600}, VIEW, 2, 0)
      ).toEqual({dx: 0, dy: -600});
    });
  });

  it('eases from rest to the end', () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(0.5)).toBeGreaterThan(0.5);
  });

  describe('the scroll', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    const BELOW = {left: 0, top: 500, right: 100, bottom: 600};

    it('arrives at the target over several frames', () => {
      const {workspace, scrolls} = fakeWorkspace();
      scrollIntoView(asWorkspace(workspace), BELOW, 0);
      jest.advanceTimersByTime(SCROLL_MS * 2);
      expect(workspace.scrollY).toBe(-300);
      expect(scrolls.length).toBeGreaterThan(3);
      const ys = scrolls.map(([, y]) => y);
      expect([...ys].sort((a, b) => b - a)).toEqual(ys);
    });

    it('does nothing for a box already in view', () => {
      const {workspace, scrolls} = fakeWorkspace();
      scrollIntoView(asWorkspace(workspace), {
        left: 0,
        top: 0,
        right: 50,
        bottom: 50,
      });
      jest.advanceTimersByTime(SCROLL_MS * 2);
      expect(scrolls).toEqual([]);
    });

    it('stops where it is when the student presses on the workspace', () => {
      const {workspace, div} = fakeWorkspace();
      scrollIntoView(asWorkspace(workspace), BELOW, 0);
      jest.advanceTimersByTime(SCROLL_MS / 3);
      const partial = workspace.scrollY;
      expect(partial).toBeLessThan(0);
      expect(partial).toBeGreaterThan(-300);
      div.dispatchEvent(new Event('pointerdown'));
      jest.advanceTimersByTime(SCROLL_MS * 2);
      expect(workspace.scrollY).toBe(partial);
    });

    it('stops when a drag begins', () => {
      const {workspace} = fakeWorkspace();
      scrollIntoView(asWorkspace(workspace), BELOW, 0);
      jest.advanceTimersByTime(SCROLL_MS / 3);
      const partial = workspace.scrollY;
      workspace.dragging = true;
      jest.advanceTimersByTime(SCROLL_MS * 2);
      expect(workspace.scrollY).toBe(partial);
    });

    it('a second call replaces the first', () => {
      const {workspace} = fakeWorkspace();
      scrollIntoView(asWorkspace(workspace), BELOW, 0);
      jest.advanceTimersByTime(SCROLL_MS / 3);
      scrollIntoView(
        asWorkspace(workspace),
        {left: 500, top: 0, right: 600, bottom: 50},
        0
      );
      jest.advanceTimersByTime(SCROLL_MS * 2);
      expect(workspace.scrollX).toBe(-200);
    });

    it('jumps under reduced motion', () => {
      const original = window.matchMedia;
      window.matchMedia = (() => ({
        matches: true,
      })) as unknown as typeof window.matchMedia;
      try {
        const {workspace, scrolls} = fakeWorkspace();
        scrollIntoView(asWorkspace(workspace), BELOW, 0);
        expect(scrolls).toEqual([[0, -300]]);
      } finally {
        window.matchMedia = original;
      }
    });
  });
});
