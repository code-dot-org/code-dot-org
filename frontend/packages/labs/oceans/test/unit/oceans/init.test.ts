import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {getState, resetState, setInitialState, setState} from '@/oceans/state';

vi.mock('@/oceans/renderer', () => ({
  render: vi.fn(),
  stopRender: vi.fn(),
}));
vi.mock('@/oceans/constants', () => ({
  default: {canvasWidth: 1024, canvasHeight: 576},
  Modes: {Loading: 0},
  OCEANS_UI_CONTAINER_ID: 'container-react',
}));
vi.mock('@/oceans/i18n', () => ({default: {initI18n: vi.fn()}}));
vi.mock('@/oceans/modeHelpers', () => ({default: {toMode: vi.fn()}}));
vi.mock('@/oceans/models/soundLibrary', () => ({
  default: {injectSoundAPIs: vi.fn(), loadSounds: vi.fn()},
}));
vi.mock('@/oceans/ui', () => ({default: () => null}));

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('guide typing timer cleanup on state reset', () => {
  it('clears guideTypingTimer before overwriting the handle', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');

    const timerId = setInterval(() => {}, 100);
    setState({guideTypingTimer: timerId});

    expect(getState().guideTypingTimer).toBe(timerId);

    setInitialState({currentMode: 0});

    expect(clearSpy).toHaveBeenCalledWith(timerId);
    expect(getState().guideTypingTimer).toBeUndefined();
  });
});

describe('stopUIRerender', () => {
  it('clears an active guideTypingTimer on teardown', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const {stopUIRerender} = await import('@/oceans/init');

    const timerId = setInterval(() => {}, 100);
    setState({guideTypingTimer: timerId});

    stopUIRerender();

    expect(clearSpy).toHaveBeenCalledWith(timerId);
    expect(getState().guideTypingTimer).toBeUndefined();
  });
});
