// The compile surface (hidden iframe on the sandbox origin). It owns esbuild-wasm
// and TRANSFORMS TEXT ONLY — it never imports or runs the module it emits
// (SANDBOX.md). On a `compile` request it bundles the project, stores the bundle
// in the transport service worker, and reports the URL the preview can import.

import {CompileError, WorldCompiler} from '../compile/esbuildCompiler';
import {
  ASSET_BASE_PARAM,
  BUILD_PATH_PREFIX,
  BuildWorkerMessage,
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
  const compiler = new WorldCompiler({
    wasmURL: `${assetBase}esbuild.wasm`,
    assetBase,
  });
  await compiler.init();
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
      const code = await compiler.compile(files, entry);
      const path = `${BUILD_PATH_PREFIX}${id}.mjs`;
      await storeModule(worker, path, code);
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

/** Hand the bundle to the SW and wait until it confirms it holds it. */
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
    const onMessage = (event: MessageEvent) => {
      if (
        event.data?.type === BuildWorkerMessage.MODULE_STORED &&
        event.data.path === path
      ) {
        navigator.serviceWorker.removeEventListener('message', onMessage);
        resolve();
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    worker.postMessage({type: BuildWorkerMessage.PUT_MODULE, path, code});
  });
}
