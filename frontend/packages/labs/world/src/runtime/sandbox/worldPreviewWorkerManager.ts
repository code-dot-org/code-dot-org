// The preview surface (visible iframe = the game canvas) on the sandbox origin.
// It imports the compiled learner module — whose default export is a built Scene
// — and hands the Scene's World to the Phaser binding, which runs the game. The
// learner module's `import 'world-lab'` was rewritten by the compiler to the
// self-hosted engine bundle URL (`/vendor/world-lab.mjs`), so there is one
// engine instance shared with the binding's type view (SANDBOX.md / PLAN §7).

import type {World} from 'world-lab';

import {PhaserBinding} from '../driver/PhaserBinding';
import {
  FromPreviewMessage,
  PARENT_ORIGIN_PARAM,
  ToPreviewMessage,
  type LoadMessage,
  type ToPreview,
} from '../messages';

import {registerBuildSw} from './registerBuildSw';

/** The shape the compiled `scenes/main` module default-exports. */
interface SceneModule {
  default?: {getWorld: () => World};
}

export async function start(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const parentOrigin = params.get(PARENT_ORIGIN_PARAM);

  const post = (message: unknown) => {
    if (parentOrigin) {
      window.parent.postMessage(message, parentOrigin);
    }
  };

  relayConsole(post);

  // Must be CONTROLLED before importing: only then is the build-URL fetch
  // intercepted and served from the SW's memory.
  await registerBuildSw({awaitControl: true});
  post({type: FromPreviewMessage.READY});

  let binding: PhaserBinding | null = null;

  window.addEventListener('message', event => {
    if (!parentOrigin || event.origin !== parentOrigin) {
      return;
    }
    const data = event.data as ToPreview;
    if (data?.type === ToPreviewMessage.LOAD) {
      void load(data);
    } else if (data?.type === ToPreviewMessage.STOP) {
      binding?.stop();
      binding = null;
    }
  });

  async function load({id, moduleUrl}: LoadMessage) {
    try {
      binding?.stop();
      binding = null;
      const mod: SceneModule = await import(/* @vite-ignore */ moduleUrl);
      const scene = mod.default;
      if (!scene || typeof scene.getWorld !== 'function') {
        throw new Error(
          `entry module must default-export a Scene (got ${typeof scene})`,
        );
      }
      const parent = document.getElementById('game') ?? document.body;
      binding = new PhaserBinding(scene.getWorld(), parent);
      post({type: FromPreviewMessage.BUILT, id});
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

/**
 * Mirror the learner's console up to the lab's Console/Debugger box. Arguments
 * are stringified — a postMessage clone cannot carry arbitrary objects, and the
 * box shows text.
 */
function relayConsole(post: (message: unknown) => void): void {
  const levels = ['log', 'info', 'warn', 'error'] as const;
  for (const level of levels) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      original(...args);
      post({
        type: FromPreviewMessage.CONSOLE,
        level,
        args: args.map(stringify),
      });
    };
  }
}

function stringify(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
