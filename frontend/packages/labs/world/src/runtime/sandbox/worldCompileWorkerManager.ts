// The compile surface (hidden iframe on the sandbox origin). It owns esbuild-wasm
// and TRANSFORMS TEXT ONLY — it never imports or runs the module it emits
// (SANDBOX.md). On a `compile` request it bundles the project, stores the bundle
// in the transport service worker, and reports the URL the preview can import.

import {version as esbuildVersion} from 'esbuild-wasm';

import {buildCacheKey, openBuildCache} from '../compile/buildCache';
import {CompileError, WorldCompiler} from '../compile/esbuildCompiler';
import {
  ASSET_BASE_PARAM,
  BUILD_PATH_PREFIX,
  BuildWorkerMessage,
  ESBUILD_WORKER_PARAM,
  FromCompileMessage,
  PARENT_ORIGIN_PARAM,
  ToCompileMessage,
  type CompileRequest,
  type ToCompile,
} from '../messages';

import {registerBuildSw} from './registerBuildSw';

export async function start(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const parentOrigin = params.get(PARENT_ORIGIN_PARAM);
  const assetBase = params.get(ASSET_BASE_PARAM) ?? '/vendor/';

  const post = (message: unknown) => {
    if (parentOrigin) {
      window.parent.postMessage(message, parentOrigin);
    }
  };

  const worker = await registerBuildSw({awaitControl: false});
  // Run esbuild in a Web Worker (default) unless the host forced the main-thread
  // fallback with `esbuildWorker=0`/`false`. See ESBUILD_WORKER_PARAM.
  const workerParam = params.get(ESBUILD_WORKER_PARAM);
  const esbuildWorker = workerParam !== '0' && workerParam !== 'false';
  const compiler = new WorldCompiler({
    wasmURL: `${assetBase}esbuild.wasm`,
    assetBase,
    esbuildWorker,
  });
  // Warm esbuild in the background, but do NOT gate READY on it: a cache HIT
  // needs no bundler, so init must not sit on the critical path. A MISS's
  // compile awaits this same in-flight init internally, so it loses nothing.
  void compiler.init();
  // Everything outside the sources that changes esbuild's output, folded into
  // the content key: the bundler version and the asset base (baked into the
  // emitted `world-lab` / `phaser` import URLs).
  const cacheSalt = `${esbuildVersion}|${assetBase}`;
  const cache = await openBuildCache();
  // Compiles in flight, keyed by content path, so two requests for the same
  // bundle (the parent can fire the initial compile twice) share one esbuild run
  // instead of racing — both would otherwise see `has() === false` and rebuild.
  const inFlight = new Map<string, Promise<void>>();
  post({type: FromCompileMessage.READY});

  window.addEventListener('message', event => {
    if (!parentOrigin || event.origin !== parentOrigin) {
      return;
    }
    const data = event.data as ToCompile;
    if (data?.type === ToCompileMessage.COMPILE) {
      void handleCompile(data);
    } else if (data?.type === ToCompileMessage.DISPOSE) {
      void compiler.dispose();
    }
  });

  async function handleCompile({id, files, entry}: CompileRequest) {
    try {
      // Content-address the bundle. On a HIT (e.g. an unchanged refresh) the
      // service worker already holds it in CacheStorage, so we skip esbuild
      // entirely; on a MISS we compile, persist it, and warm the in-memory tier
      // for the rest of this session. `id` still correlates the response.
      const key = await buildCacheKey(files, entry, cacheSalt);
      const path = `${BUILD_PATH_PREFIX}${key}.mjs`;
      if (!(await cache.has(path))) {
        let build = inFlight.get(path);
        if (!build) {
          build = (async () => {
            const code = await compiler.compile(files, entry);
            await cache.put(path, code);
            await storeModule(worker, path, code);
          })();
          inFlight.set(path, build);
          void build.finally(() => inFlight.delete(path));
        }
        await build;
      }
      post({
        type: FromCompileMessage.COMPILED,
        id,
        moduleUrl: `${window.location.origin}${path}`,
      });
    } catch (error) {
      post({
        type: FromCompileMessage.ERROR,
        id,
        message: error instanceof Error ? error.message : String(error),
        location: error instanceof CompileError ? error.location : undefined,
      });
    }
  }
}

/** How long to wait for the worker to confirm it holds the bundle. */
const STORE_TIMEOUT_MS = 10_000;

/**
 * Hand the bundle to the SW and wait until it confirms it holds it.
 *
 * The confirmation comes back over a MessageChannel, not over
 * `navigator.serviceWorker` — because this surface deliberately does NOT wait
 * to be controlled (`awaitControl: false`: a cache hit needs no worker, so
 * control must stay off the critical path), and a reply sent to an uncontrolled
 * client with `event.source.postMessage` is not delivered. That is a race, and
 * the dev server hid it: unbundled, the first compile arrives so much later
 * than `clients.claim()` that the page is always controlled by then. The
 * production build is faster, lost the race every time, and — with no reply and
 * no timeout — sat here forever while the game never started. A port belongs to
 * the message that opened it, so control cannot come into it.
 *
 * The timeout is the second half: a transport that can go quiet has to say so,
 * rather than leaving a compile pending and a preview blank.
 */
function storeModule(
  worker: ServiceWorker | null,
  path: string,
  code: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject(new Error('build service worker unavailable'));
      return;
    }
    const channel = new MessageChannel();
    const timer = setTimeout(() => {
      channel.port1.close();
      reject(
        new Error(
          `the build service worker did not confirm ${path} within ` +
            `${STORE_TIMEOUT_MS / 1000}s`,
        ),
      );
    }, STORE_TIMEOUT_MS);
    channel.port1.onmessage = event => {
      if (event.data?.type !== BuildWorkerMessage.MODULE_STORED) {
        return;
      }
      clearTimeout(timer);
      channel.port1.close();
      resolve();
    };
    worker.postMessage({type: BuildWorkerMessage.PUT_MODULE, path, code}, [
      channel.port2,
    ]);
  });
}
