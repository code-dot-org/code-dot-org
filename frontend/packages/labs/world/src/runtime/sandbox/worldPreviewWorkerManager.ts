// The preview surface (visible iframe = the game canvas) on the sandbox origin.
// It imports the compiled learner module — whose default export is a WorldBuilder
// — and hands its World to the Phaser binding, which runs the game. The
// learner module's `import 'world-lab'` was rewritten by the compiler to the
// self-hosted engine bundle URL (`/vendor/world-lab.mjs`), so there is one
// engine instance shared with the binding's type view (SANDBOX.md / PLAN §7).

import type {
  Actor,
  ActorBuilder,
  World,
  WorldBuilder,
  WorldSnapshot,
} from 'world-lab';

import {frameThumbnail} from '../driver/frameThumbnail';
import {PhaserBinding} from '../driver/PhaserBinding';
import {reconcile} from '../driver/reconcile';
import {
  ASSET_BASE_PARAM,
  FromPreviewMessage,
  PARENT_ORIGIN_PARAM,
  ToPreviewMessage,
  type ActorSchema,
  type LoadMessage,
  type ReloadMode,
  type ToPreview,
} from '../messages';

// Properties the engine models but the editor defers: applied by the engine yet
// not by the Phaser driver, so a field would be inert. Empty now that the driver
// renders every spatial property (skew shears via a per-image matrix); kept as
// the hook for the next property whose editor support lands after its rendering.
const DEFERRED_PROPS = new Set<string>([]);

/**
 * Enumerable string properties → their allowed values, so the editor renders a
 * dropdown. Keyed by `${ownerId}.${propId}`; `animation` resolves against the
 * world's live registry (the project's own animations), `sprite` against the
 * images the project holds. There is no built-in set on either side: a game
 * draws what its project has.
 */
function optionsFor(
  key: string,
  animationIds: string[],
  uploadedSprites: string[],
): string[] | undefined {
  if (key === 'appearance.sprite') {
    return [...new Set(uploadedSprites)];
  }
  if (key === 'appearance.animation') {
    return animationIds;
  }
  return undefined;
}

/**
 * Introspect an instantiated actor's editable per-instance properties, grouped
 * by the trait that declares them. A property is editable when it is actor-
 * scoped and not read-only (so falling / intrinsic-size / animation state and
 * other engine-owned state is excluded) and not deferred. Vectors are serialized
 * to plain `{x, y}` for postMessage; enum-like strings carry their `options`.
 */
function describeActor(
  actor: Actor,
  animationIds: string[],
  uploadedSprites: string[],
): ActorSchema {
  const groups: ActorSchema = [];
  for (const trait of actor.traits()) {
    const props = Object.values(trait.properties)
      .filter(
        property =>
          !property.readonly &&
          property.scope === 'actor' &&
          !DEFERRED_PROPS.has(`${property.ownerId}.${property.id}`),
      )
      .map(property => {
        // The actor template's configured value (what an unset placement
        // inherits) — e.g. the player's `playerBob` animation — not the
        // property's static default.
        const base = actor.get(property);
        const options = optionsFor(
          `${property.ownerId}.${property.id}`,
          animationIds,
          uploadedSprites,
        );
        return {
          ownerId: property.ownerId,
          propId: property.id,
          name: property.name ?? property.id,
          type: property.type,
          default:
            property.type === 'vector' || property.type === 'point'
              ? {x: (base as {x: number}).x, y: (base as {y: number}).y}
              : base,
          ...(options ? {options} : {}),
        };
      });
    if (props.length) {
      groups.push({trait: trait.id, traitName: trait.name, props});
    }
  }
  return groups;
}

import {registerBuildSw} from './registerBuildSw';

const THUMBNAIL_SIZE = 48;

/** The default export of a compiled thumbnail-manifest module. */
interface ThumbnailManifest {
  default?: {
    world: WorldBuilder;
    actors: Array<{type: string; builder: ActorBuilder}>;
  };
}

/** The shape the compiled entry module (`worlds/main`) default-exports. */
interface EntryModule {
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
  relayUncaught(post);

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
    const schemas: Record<string, ActorSchema> = {};
    try {
      const mod: ThumbnailManifest = await import(/* @vite-ignore */ moduleUrl);
      const manifest = mod.default;
      if (manifest) {
        const world = manifest.world.instantiate();
        const animationIds = world.animationIds();
        // Uploaded sprites: the same asset map the thumbnails render from — its
        // keys are the sprite names a placement may reference.
        const uploadedSprites = Object.keys(lastAssets);
        const typeOf = new Map<unknown, string>();
        for (const {type, builder} of manifest.actors) {
          const actor = builder.instantiate(`thumb:${type}`);
          world.addActor(actor);
          typeOf.set(actor, type);
          schemas[type] = describeActor(actor, animationIds, uploadedSprites);
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
    post({type: FromPreviewMessage.THUMBNAILS, id, thumbnails, schemas});
  }

  /**
   * An effect that will not compile, reported from inside the render loop.
   *
   * `phase: 'tick'` rather than `'construct'`: the game is up and drawing, and
   * the actor wearing the broken effect is on screen without it. The message
   * names the `.effect` file, which is what makes the compiler's sentence about
   * a graph actionable.
   */
  function reportEffectError(message: string) {
    post({
      type: FromPreviewMessage.ENGINE_ERROR,
      message,
      phase: 'tick',
    });
  }

  /**
   * A throw out of the learner's code, reported from inside the render loop.
   *
   * The binding has already stopped simulating by the time this is called (see
   * PhaserBinding's `guard`), so this is the one report for that error rather
   * than the first of one per frame.
   */
  function reportRuntimeError(message: string, stack?: string) {
    post({
      type: FromPreviewMessage.ENGINE_ERROR,
      message,
      stack,
      phase: 'tick',
    });
  }

  async function load({id, moduleUrl, assets}: LoadMessage) {
    lastAssets = assets ?? {};
    try {
      const mod: EntryModule = await import(/* @vite-ignore */ moduleUrl);
      const entry = mod.default;
      if (!entry || typeof entry.getWorld !== 'function') {
        throw new Error(
          `entry module must default-export a World (got ${typeof entry})`,
        );
      }
      const incoming = entry.getWorld();
      const parent = document.getElementById('game') ?? document.body;

      let mode: ReloadMode;
      if (binding && runningWorld && incoming === runningWorld) {
        // The very module the game is already running.
        //
        // Build URLs are a content hash of every project file (`buildCacheKey`),
        // so an unchanged bundle re-imports to the same module instance — and
        // `WorldBuilder.getWorld()` memoizes, so it hands back the World that
        // has been ticking. A rebuild lands here
        // whenever something outside the bundle changes; opening a file is
        // enough, since `openFiles` is part of the project but not of the hash.
        //
        // Returning early is not just an optimisation. Reconciling would
        // compare the pre-tick baseline against a world mid-flight and see
        // every moving actor as changed — and then store THAT as the next
        // baseline, so the following real edit would be measured against
        // mid-game positions and restart too. One stray rebuild would poison
        // hot reload for the rest of the session.
        post({
          type: FromPreviewMessage.BUILT,
          id,
          detail: {mode: 'unchanged', world: runningWorld.snapshot().world},
        });
        return;
      }
      if (!binding || !runningWorld) {
        // First load: start fresh.
        runningWorld = incoming;
        binding = new PhaserBinding(
          incoming,
          parent,
          assets,
          reportEffectError,
          reportRuntimeError,
        );
        baseline = incoming.snapshot();
        mode = 'built';
      } else {
        // Reconcile against the last build; patch live or restart.
        const result = reconcile(runningWorld, incoming, baseline);
        baseline = result.snapshot;
        mode = result.mode;
        if (result.mode === 'restarted') {
          binding.stop();
          binding = null;
          runningWorld = incoming;
          binding = new PhaserBinding(
            incoming,
            parent,
            assets,
            reportEffectError,
            reportRuntimeError,
          );
        }
        // 'reconciled': reconcile() already patched runningWorld; keep the game.
      }

      post({
        type: FromPreviewMessage.BUILT,
        id,
        detail: {mode, world: runningWorld.snapshot().world},
      });
    } catch (error) {
      // Whatever was half-built is not a game. Leaving `binding` set would have
      // the next load reconcile against a world that never ran — and leaving its
      // canvas in the pane is how two of them end up stacked.
      try {
        binding?.stop();
      } catch {
        // stop() already swallows what it can; this is the last resort.
      }
      binding = null;
      runningWorld = null;
      baseline = null;
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
 * Report anything that reaches the sandbox window uncaught.
 *
 * The guards elsewhere catch what they know how to catch — a module that will
 * not import, a step body that throws. This is for the rest: a callback the
 * engine invoked from a timer, a rejected promise nobody awaited, an error
 * inside a Phaser internal. Uncaught in an IFRAME means invisible, since the
 * learner is not looking at a devtools console on the sandbox origin, and the
 * error they need is a `console.log` away from the one they can see.
 *
 * Reported as `phase: 'tick'` — construction has, by definition, already
 * finished if this fires.
 */
function relayUncaught(post: (message: unknown) => void): void {
  window.addEventListener('error', event => {
    post({
      type: FromPreviewMessage.ENGINE_ERROR,
      message: event.message || String(event.error ?? 'Unknown error'),
      stack: event.error instanceof Error ? event.error.stack : undefined,
      phase: 'tick',
    });
  });
  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    post({
      type: FromPreviewMessage.ENGINE_ERROR,
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      phase: 'tick',
    });
  });
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
