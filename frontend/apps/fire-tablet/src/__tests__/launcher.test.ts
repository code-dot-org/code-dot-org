import {InAppBrowser} from '@capacitor/inappbrowser';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {startLauncher} from '../launcher';

const addListener = vi.hoisted(() =>
  vi.fn<
    (
      event: 'browserClosed',
      callback: () => void,
    ) => ReturnType<typeof InAppBrowser.addListener>
  >(),
);

vi.mock('@capacitor/inappbrowser', async importOriginal => ({
  ...(await importOriginal<typeof import('@capacitor/inappbrowser')>()),
  InAppBrowser: {addListener, openInWebView: vi.fn()},
}));

describe('startLauncher', () => {
  let close: () => void;
  const remove = vi.fn(async () => {});

  beforeEach(() => {
    vi.resetAllMocks();
    addListener.mockImplementation(async (_, callback) => {
      close = callback;
      return {remove};
    });
    vi.mocked(InAppBrowser.openInWebView).mockResolvedValue();
  });

  it('should register closure before opening once when bootstrapped', async () => {
    const states = vi.fn();
    startLauncher(states);
    await vi.waitFor(() => expect(states).toHaveBeenLastCalledWith('active'));
    expect(InAppBrowser.addListener).toHaveBeenCalledWith(
      'browserClosed',
      expect.any(Function),
    );
    expect(InAppBrowser.addListener).toHaveBeenCalledTimes(1);
    expect(InAppBrowser.addListener).toHaveBeenCalledBefore(
      vi.mocked(InAppBrowser.openInWebView),
    );
    expect(InAppBrowser.openInWebView).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({url: 'https://studio.code.org/'}),
    );
  });

  it('should suppress duplicate requests when opening or active', async () => {
    const states = vi.fn();
    const launcher = startLauncher(states);
    await launcher.open();
    await vi.waitFor(() => expect(states).toHaveBeenLastCalledWith('active'));
    await launcher.open();
    expect(InAppBrowser.openInWebView).toHaveBeenCalledTimes(1);
  });

  it('should reopen only after a deliberate action when closed', async () => {
    const states = vi.fn();
    const launcher = startLauncher(states);
    await vi.waitFor(() => expect(states).toHaveBeenLastCalledWith('active'));
    close();
    expect(states).toHaveBeenLastCalledWith('closed');
    expect(InAppBrowser.openInWebView).toHaveBeenCalledTimes(1);
    await launcher.open();
    expect(InAppBrowser.openInWebView).toHaveBeenCalledTimes(2);
    expect(InAppBrowser.addListener).toHaveBeenCalledTimes(1);
  });

  it('should retry initialization without opening when listener registration fails', async () => {
    addListener.mockRejectedValueOnce(new Error('listener'));
    const states = vi.fn();
    const launcher = startLauncher(states);
    await vi.waitFor(() => expect(states).toHaveBeenLastCalledWith('failed'));
    expect(InAppBrowser.openInWebView).not.toHaveBeenCalled();
    await launcher.open();
    expect(states).toHaveBeenLastCalledWith('active');
    expect(InAppBrowser.addListener).toHaveBeenCalledTimes(2);
  });

  it('should reuse the listener when failed opening is retried repeatedly', async () => {
    vi.mocked(InAppBrowser.openInWebView)
      .mockRejectedValueOnce(new Error('open'))
      .mockRejectedValueOnce(new Error('open'));
    const states = vi.fn();
    const launcher = startLauncher(states);
    await vi.waitFor(() => expect(states).toHaveBeenLastCalledWith('failed'));
    await launcher.open();
    expect(states).toHaveBeenLastCalledWith('failed');
    await launcher.open();
    expect(states).toHaveBeenLastCalledWith('active');
    expect(InAppBrowser.addListener).toHaveBeenCalledTimes(1);
  });

  it.each(['resolve', 'reject'] as const)(
    'should ignore late %s when the view has closed and reopened',
    async settlement => {
      let resolve!: () => void;
      let reject!: (reason: Error) => void;
      vi.mocked(InAppBrowser.openInWebView).mockImplementationOnce(
        () =>
          new Promise<void>((success, failure) => {
            resolve = success;
            reject = failure;
          }),
      );
      const states = vi.fn();
      const launcher = startLauncher(states);
      await vi.waitFor(() =>
        expect(InAppBrowser.openInWebView).toHaveBeenCalled(),
      );
      close();
      expect(states).toHaveBeenLastCalledWith('closed');
      await launcher.open();
      expect(states).toHaveBeenLastCalledWith('active');
      states.mockClear();
      if (settlement === 'resolve') resolve();
      else reject(new Error('late'));
      await Promise.resolve();
      expect(states).not.toHaveBeenCalled();
      expect(InAppBrowser.openInWebView).toHaveBeenCalledTimes(2);
    },
  );

  it('should remove only its own listener and prevent reopening when disposed', async () => {
    const states = vi.fn();
    const launcher = startLauncher(states);
    await vi.waitFor(() => expect(states).toHaveBeenLastCalledWith('active'));
    await launcher.dispose();
    states.mockClear();
    close();
    await launcher.open();
    expect(states).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(InAppBrowser.openInWebView).toHaveBeenCalledTimes(1);
  });

  it('should clean up without opening when disposed during registration', async () => {
    let resolve!: (handle: {remove: typeof remove}) => void;
    addListener.mockImplementationOnce(
      () =>
        new Promise(success => {
          resolve = success;
        }),
    );
    const launcher = startLauncher(vi.fn());
    await launcher.dispose();
    resolve({remove});
    await vi.waitFor(() => expect(remove).toHaveBeenCalledTimes(1));
    expect(InAppBrowser.openInWebView).not.toHaveBeenCalled();
  });
});
