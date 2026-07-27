// The single entry both sandbox pages load. It picks the surface's role from
// the URL and lazily imports ONLY that role's manager — so the preview bundle
// never pulls in esbuild-wasm, and the preview surface needs no wasm-eval in its
// CSP (SANDBOX.md). compile.html and preview.html exist as separate paths so the
// server can attach each surface's own CSP; the role is derived from either the
// `?role=` param or the page's filename.

import {ROLE_PARAM, SandboxRole} from '../messages';

const params = new URLSearchParams(window.location.search);
const role =
  params.get(ROLE_PARAM) ??
  (window.location.pathname.includes('compile')
    ? SandboxRole.COMPILE
    : SandboxRole.PREVIEW);

if (role === SandboxRole.COMPILE) {
  void import('./worldCompileWorkerManager').then(m => m.start());
} else {
  void import('./worldPreviewWorkerManager').then(m => m.start());
}
