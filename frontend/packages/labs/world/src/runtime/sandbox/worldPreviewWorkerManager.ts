// The preview surface (visible iframe = the game canvas) on the sandbox origin.
// In milestone 2 it does the minimum that proves the transport: import the
// compiled module the SW serves and report that it ran. The Phaser engine and
// the game loop arrive in milestone 3; there is intentionally no game yet.

import {
  FromPreviewMessage,
  PARENT_ORIGIN_PARAM,
  ToPreviewMessage,
  type LoadMessage,
  type ToPreview,
} from '../messages';

import {registerBuildSw} from './registerBuildSw';

export async function start(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const parentOrigin = params.get(PARENT_ORIGIN_PARAM);

  const post = (message: unknown) => {
    if (parentOrigin) {
      window.parent.postMessage(message, parentOrigin);
    }
  };

  // Must be CONTROLLED before importing: only then is the build-URL fetch
  // intercepted and served from the SW's memory.
  await registerBuildSw({awaitControl: true});
  post({type: FromPreviewMessage.READY});

  window.addEventListener('message', event => {
    if (!parentOrigin || event.origin !== parentOrigin) {
      return;
    }
    const data = event.data as ToPreview;
    if (data?.type === ToPreviewMessage.LOAD) {
      void load(data);
    }
    // ToPreviewMessage.STOP: nothing to tear down until there is a game.
  });

  async function load({id, moduleUrl}: LoadMessage) {
    try {
      const mod = await import(/* @vite-ignore */ moduleUrl);
      post({type: FromPreviewMessage.BUILT, id, detail: mod?.default ?? null});
    } catch (error) {
      post({
        type: FromPreviewMessage.ENGINE_ERROR,
        id,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        phase: 'construct',
      });
    }
  }
}
