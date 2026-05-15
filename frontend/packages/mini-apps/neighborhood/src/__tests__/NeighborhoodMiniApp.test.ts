import {beforeEach, describe, expect, it, vi} from 'vitest';

// Mock the inner Neighborhood class entirely — it pulls in MazeController
// and DOM-heavy maze state we don't want to exercise here. The MiniApp
// wrapper's job is only to delegate, and that's what we're asserting.
//
// `vi.hoisted` keeps the shared spies usable from both the mock factory
// (which vitest hoists above the imports) and the test body.
const {ctorSpy, inner} = vi.hoisted(() => {
  const innerStub = {
    handleSignal: vi.fn(),
    onRun: vi.fn(),
    onStop: vi.fn(),
    onClose: vi.fn(),
    reset: vi.fn(),
    waitUntilDone: vi.fn().mockResolvedValue(undefined),
  };
  return {ctorSpy: vi.fn(), inner: innerStub};
});

vi.mock('../Neighborhood', () => ({
  default: class FakeNeighborhood {
    handleSignal = inner.handleSignal;
    onRun = inner.onRun;
    onStop = inner.onStop;
    onClose = inner.onClose;
    reset = inner.reset;
    waitUntilDone = inner.waitUntilDone;
    constructor(...args: unknown[]) {
      ctorSpy(...args);
    }
  },
}));

import {NEIGHBORHOOD_NAME, NEIGHBORHOOD_SIGNAL_TAG} from '../constants';
import {NeighborhoodMiniApp} from '../NeighborhoodMiniApp';
import NeighborhoodPreview from '../NeighborhoodPreview';

const stubDeps = () => ({
  onOutputMessage: vi.fn(),
  onNewlineMessage: vi.fn(),
  onPartialOutputMessage: vi.fn(),
  setIsRunning: vi.fn(),
});

describe('NeighborhoodMiniApp', () => {
  beforeEach(() => {
    ctorSpy.mockClear();
    Object.values(inner).forEach(m => m.mockClear());
  });

  it('exposes the static identity required by the MiniApp contract', () => {
    const app = new NeighborhoodMiniApp(stubDeps());
    expect(app.name).toBe(NEIGHBORHOOD_NAME);
    expect(app.signalTag).toBe(NEIGHBORHOOD_SIGNAL_TAG);
    expect(app.PreviewComponent).toBe(NeighborhoodPreview);
  });

  it('forwards deps to the inner Neighborhood in the expected order', () => {
    // The inner constructor pre-dates MiniAppDeps and still uses a
    // positional signature; the wrapper has to translate. Pin the order
    // here so a future inner refactor that swaps args (or the wrapper
    // misordering them) fails this test rather than silently breaking.
    const deps = stubDeps();
    new NeighborhoodMiniApp(deps);
    expect(ctorSpy).toHaveBeenCalledWith(
      deps.onOutputMessage,
      deps.onNewlineMessage,
      deps.setIsRunning,
      deps.onPartialOutputMessage,
    );
  });

  it('delegates lifecycle methods to the inner Neighborhood', () => {
    const app = new NeighborhoodMiniApp(stubDeps());
    app.onRun();
    app.onStop();
    app.onClose();
    app.reset();
    expect(inner.onRun).toHaveBeenCalledTimes(1);
    expect(inner.onStop).toHaveBeenCalledTimes(1);
    expect(inner.onClose).toHaveBeenCalledTimes(1);
    expect(inner.reset).toHaveBeenCalledTimes(1);
  });

  it('delegates handleSignal and waitUntilDone', async () => {
    const app = new NeighborhoodMiniApp(stubDeps());
    const signal = {value: 'MOVE'} as never;
    app.handleSignal(signal);
    expect(inner.handleSignal).toHaveBeenCalledWith(signal);

    await expect(app.waitUntilDone()).resolves.toBeUndefined();
    expect(inner.waitUntilDone).toHaveBeenCalledTimes(1);
  });

  it('parseSignal delegates to parseNeighborhoodSignal (real impl)', () => {
    const app = new NeighborhoodMiniApp(stubDeps());
    expect(app.parseSignal('[NEIGHBORHOOD] TURN_LEFT')).toEqual({
      value: 'TURN_LEFT',
      detail: undefined,
    });
    expect(app.parseSignal('not a signal')).toBeNull();
  });

  it('parseException delegates to parseNeighborhoodException (real impl)', () => {
    const app = new NeighborhoodMiniApp(stubDeps());
    expect(app.parseException('plain traceback with no marker')).toBeNull();
    const out = app.parseException(
      'NeighborhoodRuntimeException: INVALID_MOVE',
    );
    expect(typeof out).toBe('string');
  });

  it('adopts an externally-supplied Neighborhood instance', () => {
    // The migration path: codebridge passes an already-constructed
    // legacy Neighborhood (or anything matching NeighborhoodLike) and
    // we wrap it without constructing a fresh one.
    const adopted = {
      handleSignal: vi.fn(),
      onRun: vi.fn(),
      onStop: vi.fn(),
      onClose: vi.fn(),
      reset: vi.fn(),
      waitUntilDone: vi.fn().mockResolvedValue(undefined),
    };
    const app = new NeighborhoodMiniApp(adopted);
    // The inner constructor must not fire when we adopt.
    expect(ctorSpy).not.toHaveBeenCalled();
    app.onRun();
    app.handleSignal({value: 'MOVE'} as never);
    expect(adopted.onRun).toHaveBeenCalledTimes(1);
    expect(adopted.handleSignal).toHaveBeenCalledTimes(1);
    expect(app.getNeighborhood()).toBe(adopted);
  });
});
