// Lab-side harness for the milestone-2 round-trip (spikes/milestone-2/roundtrip.mjs).
// Runs on the lab origin, wires the REAL parent managers, and exposes a
// `window.__roundtrip` the Playwright driver calls. Not shipped — a throwaway
// verification of the assembled transport.

import {WorldCompileManager} from '../../src/runtime/sandbox/worldCompileManager';
import {WorldPreviewManager} from '../../src/runtime/sandbox/worldPreviewManager';
import {parseSandboxUrl} from '../../src/runtime/worldConfig';

declare global {
  interface Window {
    __roundtrip: (
      files: Record<string, string>,
      entry: string,
    ) => Promise<{url: string; detail: unknown}>;
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
document.body.appendChild(preview.iframe);

window.__roundtrip = async (files, entry) => {
  const url = await compile.compile(files, entry);
  const detail = await preview.load(url);
  return {url, detail};
};
window.__ready = true;
