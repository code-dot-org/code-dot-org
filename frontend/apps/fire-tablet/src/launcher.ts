import type {PluginListenerHandle} from '@capacitor/core';
import {DefaultWebViewOptions, InAppBrowser} from '@capacitor/inappbrowser';

export type LauncherState = 'opening' | 'active' | 'failed' | 'closed';

export function startLauncher(onStateChange: (state: LauncherState) => void): {
  open: () => Promise<void>;
  dispose: () => Promise<void>;
} {
  let state: LauncherState = 'closed';
  let listener: PluginListenerHandle | undefined;
  let attempt = 0;
  let disposed = false;

  function update(next: LauncherState): void {
    state = next;
    onStateChange(next);
  }

  async function open(): Promise<void> {
    if (disposed || state === 'opening' || state === 'active') return;
    const currentAttempt = ++attempt;
    update('opening');
    try {
      if (!listener) {
        listener = await InAppBrowser.addListener('browserClosed', () => {
          if (disposed) return;
          ++attempt;
          update('closed');
        });
      }
      if (disposed) {
        await listener.remove();
        listener = undefined;
        return;
      }
      if (currentAttempt !== attempt) return;
      await InAppBrowser.openInWebView({
        url: 'https://studio.code.org/',
        options: {
          ...DefaultWebViewOptions,
          showToolbar: false,
          showURL: false,
          showNavigationButtons: false,
          clearCache: false,
          clearSessionCache: false,
          mediaPlaybackRequiresUserAction: true,
          android: {
            ...DefaultWebViewOptions.android,
            hardwareBack: true,
            allowZoom: true,
            pauseMedia: true,
            isIsolated: true,
          },
        },
      });
      // An accepted request says nothing about remote page loading or sign-in.
      if (!disposed && currentAttempt === attempt) update('active');
    } catch {
      if (!disposed && currentAttempt === attempt) update('failed');
    }
  }

  async function dispose(): Promise<void> {
    disposed = true;
    ++attempt;
    await listener?.remove();
    listener = undefined;
  }

  void open();
  return {open, dispose};
}
