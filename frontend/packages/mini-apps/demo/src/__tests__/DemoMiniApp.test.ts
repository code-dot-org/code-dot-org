import {describe, expect, it, vi} from 'vitest';

import {DEMO_NAME, DEMO_SIGNAL_TAG, DemoMiniApp} from '../DemoMiniApp';
import DemoPreview from '../DemoPreview';

const stubDeps = () => ({
  onOutputMessage: vi.fn(),
  onNewlineMessage: vi.fn(),
  onPartialOutputMessage: vi.fn(),
  setIsRunning: vi.fn(),
});

describe('DemoMiniApp', () => {
  it('exposes the static identity required by the MiniApp contract', () => {
    const app = new DemoMiniApp(stubDeps());
    expect(app.name).toBe(DEMO_NAME);
    expect(app.signalTag).toBe(DEMO_SIGNAL_TAG);
    expect(app.PreviewComponent).toBe(DemoPreview);
  });

  it('parseSignal always returns null (no protocol)', () => {
    const app = new DemoMiniApp(stubDeps());
    expect(app.parseSignal()).toBeNull();
  });

  it('lifecycle methods are no-ops and waitUntilDone resolves', async () => {
    const app = new DemoMiniApp(stubDeps());
    expect(() => {
      app.onRun();
      app.onStop();
      app.onClose();
      app.reset();
      app.handleSignal();
    }).not.toThrow();
    await expect(app.waitUntilDone()).resolves.toBeUndefined();
  });
});
