// The preview surface (visible iframe = the game canvas) on the sandbox origin.
// It imports the compiled learner module — whose default export is a built Scene
// — and hands the Scene's World to the Phaser binding, which runs the game. The
// learner module's `import 'world-lab'` was rewritten by the compiler to the
// self-hosted engine bundle URL (`/vendor/world-lab.mjs`), so there is one
// engine instance shared with the binding's type view (SANDBOX.md / PLAN §7).

import type {ActorBuilder, World, WorldBuilder, WorldSnapshot} from 'world-lab';

import {frameThumbnail} from '../driver/frameThumbnail';
import {PhaserBinding} from '../driver/PhaserBinding';
import {reconcile} from '../driver/reconcile';
import {
  ASSET_BASE_PARAM,
  FromPreviewMessage,
  PARENT_ORIGIN_PARAM,
  ToPreviewMessage,
  type LoadMessage,
  type ReloadMode,
  type ToPreview,
} from '../messages';

import {registerBuildSw} from './registerBuildSw';

const THUMBNAIL_SIZE = 48;

/** The default export of a compiled thumbnail-manifest module. */
interface ThumbnailManifest {
  default?: {
    world: WorldBuilder;
    actors: Array<{type: string; builder: ActorBuilder}>;
  };
}

/** The shape the compiled `scenes/main` module default-exports. */
interface SceneModule {
  default?: {getWorld: () => World};
}

export async function start(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const parentOrigin = params.get(PARENT_ORIGIN_PARAM);
  // Where the preview loads its self-hosted sprite textures from.
  const assetBase = params.get(ASSET_BASE_PARAM) ?? '/vendor/';

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

  // The running game and the baseline snapshot for hot-reload decisions.
  let binding: PhaserBinding | null = null;
  let runningWorld: World | null = null;
  let baseline: WorldSnapshot | null = null;
  // The last load's uploaded textures — reused when rendering thumbnails.
  let lastAssets: Record<string, string> = {};

  window.addEventListener('message', event => {
    if (!parentOrigin || event.origin !== parentOrigin) {
      return;
    }
    const data = event.data as ToPreview;
    if (data?.type === ToPreviewMessage.LOAD) {
      void load(data);
    } else if (data?.type === ToPreviewMessage.THUMBNAILS) {
      void sendThumbnails(data.id, data.moduleUrl);
    } else if (data?.type === ToPreviewMessage.STOP) {
      binding?.stop();
      binding = null;
      runningWorld = null;
      baseline = null;
    } else if (data?.type === ToPreviewMessage.COLORS) {
      // Paint the letterbox (page background) and outline the game box with a 1px
      // border. The border is a box-shadow on the game container, which the
      // body's `overflow: hidden` clips on any side flush with the pane edge — so
      // it shows only on the open (letterboxed) sides, no measuring needed.
      document.body.style.background = data.background;
      const game = document.getElementById('game');
      if (game) {
        game.style.boxShadow = data.border
          ? `0 0 0 1px ${data.border}`
          : 'none';
      }
    }
  });

  /**
   * Render each actor a thumbnail-manifest module lists to a data URL. Builds a
   * throwaway world from the manifest, adds one of each actor (no tick — their
   * initial frame is what the picker shows), and draws each frame. Independent
   * of the running game.
   */
  async function sendThumbnails(id: string, moduleUrl: string) {
    const thumbnails: Record<string, string> = {};
    try {
      const mod: ThumbnailManifest = await import(/* @vite-ignore */ moduleUrl);
      const manifest = mod.default;
      if (manifest) {
        const world = manifest.world.instantiate();
        const typeOf = new Map<unknown, string>();
        for (const {type, builder} of manifest.actors) {
          const actor = builder.instantiate(`thumb:${type}`);
          world.addActor(actor);
          typeOf.set(actor, type);
        }
        for (const state of world.renderSnapshot()) {
          const type = typeOf.get(state.actor);
          if (type) {
            thumbnails[type] = await frameThumbnail(
              state.frame,
              assetBase,
              lastAssets,
              THUMBNAIL_SIZE,
            );
          }
        }
      }
    } catch (error) {
      post({
        type: FromPreviewMessage.ENGINE_ERROR,
        id,
        message: error instanceof Error ? error.message : String(error),
        phase: 'construct',
      });
      return;
    }
    post({type: FromPreviewMessage.THUMBNAILS, id, thumbnails});
  }

  async function load({id, moduleUrl, assets}: LoadMessage) {
    lastAssets = assets ?? {};
    try {
      const mod: SceneModule = await import(/* @vite-ignore */ moduleUrl);
      const scene = mod.default;
      if (!scene || typeof scene.getWorld !== 'function') {
        throw new Error(
          `entry module must default-export a Scene (got ${typeof scene})`,
        );
      }
      const incoming = scene.getWorld();
      const parent = document.getElementById('game') ?? document.body;

      let mode: ReloadMode;
      if (!binding || !runningWorld) {
        // First load: start fresh.
        runningWorld = incoming;
        binding = new PhaserBinding(incoming, parent, assetBase, assets);
        baseline = incoming.snapshot();
        mode = 'built';
      } else {
        // Reconcile against the last build; patch live or restart.
        const result = reconcile(runningWorld, incoming, baseline);
        baseline = result.snapshot;
        mode = result.mode;
        if (result.mode === 'restarted') {
          binding.stop();
          runningWorld = incoming;
          binding = new PhaserBinding(incoming, parent, assetBase, assets);
        }
        // 'reconciled': reconcile() already patched runningWorld; keep the game.
      }

      post({
        type: FromPreviewMessage.BUILT,
        id,
        detail: {mode, world: runningWorld.snapshot().world},
      });
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
