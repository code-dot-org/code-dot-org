// Lab-side harness for the milestone-3 render round-trip. Like milestone-2's,
// but it captures the preview's relayed console so the driver can assert the
// game actually ran (the falling actor's events). Throwaway.

import {WorldCompileManager} from '../../src/runtime/sandbox/worldCompileManager';
import {WorldPreviewManager} from '../../src/runtime/sandbox/worldPreviewManager';
import {parseSandboxUrl} from '../../src/runtime/worldConfig';

declare global {
  interface Window {
    __roundtrip: (
      files: Record<string, string>,
      entry: string,
    ) => Promise<{url: string}>;
    __ready: boolean;
    __console: string[];
  }
}

const sandboxUrl = parseSandboxUrl(window.location.search);
if (!sandboxUrl) {
  throw new Error('harness requires ?world-sandbox=');
}
const assetBase = '/vendor/';
window.__console = [];

const compile = new WorldCompileManager({sandboxUrl, assetBase});
const preview = new WorldPreviewManager({
  sandboxUrl,
  assetBase,
  onConsole: (level, args) =>
    window.__console.push(`${level}: ${args.join(' ')}`),
  onEngineError: message => window.__console.push(`engine_error: ${message}`),
});
preview.iframe.style.width = '400px';
preview.iframe.style.height = '300px';
preview.iframe.style.border = '0';
document.body.appendChild(preview.iframe);

window.__roundtrip = async (files, entry) => {
  const url = await compile.compile(files, entry);
  await preview.load(url);
  return {url};
};
window.__ready = true;
