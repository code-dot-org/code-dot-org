// Lab-side harness for the milestone-4 hot-reload round-trip. Exposes
// `window.__load(files, entry)` which compiles + loads a project and returns the
// preview's reload report ({mode, world}). Throwaway.

import {WorldCompileManager} from '../../src/runtime/sandbox/worldCompileManager';
import {WorldPreviewManager} from '../../src/runtime/sandbox/worldPreviewManager';
import {parseSandboxUrl} from '../../src/runtime/worldConfig';

declare global {
  interface Window {
    __load: (files: Record<string, string>, entry: string) => Promise<unknown>;
    __ready: boolean;
  }
}

const sandboxUrl = parseSandboxUrl(window.location.search);
if (!sandboxUrl) {
  throw new Error('harness requires ?world-sandbox=');
}
const assetBase = '/vendor/';

const compile = new WorldCompileManager({sandboxUrl, assetBase});
const preview = new WorldPreviewManager({sandboxUrl, assetBase});
preview.iframe.style.width = '400px';
preview.iframe.style.height = '300px';
preview.iframe.style.border = '0';
document.body.appendChild(preview.iframe);

window.__load = async (files, entry) => {
  const url = await compile.compile(files, entry);
  return preview.load(url); // resolves with the BUILT detail (ReloadReport)
};
window.__ready = true;
