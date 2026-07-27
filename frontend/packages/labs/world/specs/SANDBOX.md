# Sandbox

Learner-supplied code is untrusted. It must not reach the network, the user's
session, or the lab's own page. This document is the normative statement of how
World Lab isolates it. `PLAN.md` describes the implementation that realizes this
model; where the two disagree, this document governs the isolation properties
and `PLAN.md` governs the mechanism.

## The boundary

There are two origins.

- The **lab origin** serves the editor (Studio, or the standalone demo). It
  holds the user's session. It never executes learner-derived code, and never
  instantiates WebAssembly on the learner's behalf.
- The **sandbox origin** is a separate domain that holds no session and reaches
  no network. Everything derived from the learner — their source, the code
  compiled from it, and the running game — lives here.

The origin split is the only load-bearing security boundary. Same-origin policy,
not a CSP nicety, is what keeps learner code away from the session: because the
sandbox is a different origin, code running there cannot read the lab's cookies,
storage, or DOM, regardless of what it does.

All learner-derived code lives and runs on the sandbox origin. There can be no
exceptions. In particular, the in-process interpreter that some other labs use
to run student code on the lab's own page is not acceptable here — it runs on
the lab origin, which this rule forbids.

## Two surfaces on the sandbox origin

World Lab, unlike Web Lab and Python Lab, must **compile** the learner's project
(multi-file TypeScript/JavaScript) into a runnable module before a game can
start. Compilation and execution are two different dangerous capabilities, and
we keep them on two separate surfaces — two iframes on the one sandbox origin —
so they never coincide:

- The **compile surface** (a hidden iframe) runs the bundler (esbuild-wasm). It
  parses and transforms source _text_ only. It never imports or runs the module
  it emits. No learner logic ever executes here.
- The **preview surface** (a visible iframe — the game canvas the student
  watches) hosts the engine and Phaser, imports the compiled module, and runs
  the game. This is the only place learner logic executes.

Both iframes share the one sandbox origin. They are same-origin to each other,
which is what lets the compile surface hand the compiled module to the preview
surface locally (see _Transport_); both are cross-origin to the lab, which is
the boundary that matters. Splitting them is not cosmetic: it lets each surface
carry the _minimum_ capability it needs (see _Content-Security-Policy_), so the
surface that can instantiate WebAssembly never runs learner code, and the
surface that runs learner code need not be able to instantiate WebAssembly.

## Content-Security-Policy

Each surface is served with its own policy. Both are generated on the lab side
and shipped to the sandbox with the source, as Web Lab does, so a level can
tighten them (for example, denying scripts on a predict level).

### Compile surface

```
default-src 'self';
script-src  'self' 'wasm-unsafe-eval';
connect-src 'self';
```

`'wasm-unsafe-eval'` is the narrow CSP Level 3 keyword that permits
`WebAssembly.compile` / `WebAssembly.instantiate` from bytes while still
forbidding JavaScript `eval` and `new Function`. It is strictly weaker than
`'unsafe-eval'`. The only thing it authorizes here is our own vendored,
self-hosted esbuild-wasm instantiating its own WebAssembly — verified necessary
and sufficient (milestone-0 Spike C: with it esbuild initializes; without it,
instantiation is refused).

`connect-src 'self'` is required, not `'none'`: esbuild-wasm fetches its own
`esbuild.wasm`, and a `fetch` is governed by `connect-src`. This is a same-origin
static asset only — no cross-origin destination is reachable, the surface is
sessionless, and no learner-derived code runs here — so it grants the learner
nothing. (A stricter alternative inlines the wasm bytes into the bundle to keep
`connect-src 'none'`, at the cost of a large base64 blob; not worth it.)

The bundler is initialized with `worker: false` so esbuild runs on this
surface's own (idle, hidden) main thread rather than spawning a blob-URL Web
Worker — which would otherwise force `worker-src blob:` into this policy.

Because no learner-derived code runs on this surface — the compiler emits a
module but never imports it — learner-supplied WebAssembly cannot execute here.

Compatibility: `'wasm-unsafe-eval'` is a recent keyword; engines that predate it
fall back to requiring the broader `'unsafe-eval'`. The target browser matrix
must be checked; if the fallback is needed it applies to the compile surface
only, which still runs no learner code.

### Preview surface

```
default-src   'self';
script-src    'self';            /* + blob: only under the fallback transport */
connect-src   'none';
img-src       'self' blob: data:;
font-src      'self';
style-src     'self' 'unsafe-inline';
frame-ancestors <lab-origin> 'self';
form-action   'none';
```

The preview imports the compiled module by a self-origin URL (see _Transport_),
so `script-src 'self'` suffices and no `blob:` or `eval` of any kind is required
to run learner code. Sprites and other assets arrive as `blob:` / `data:` URLs
built from the project, never fetched from the network. The surface is
credential-less.

`'wasm-unsafe-eval'` is **deliberately omitted** from the preview surface. If it
is absent, learner-supplied WebAssembly is refused outright — a learner cannot
smuggle a `.wasm` into their project and have it run. Whether we can keep it
absent depends on Phaser: if the Phaser build needs no WebAssembly, the preview
stays wasm-free; if it does, the keyword must be added and learner WebAssembly
becomes possible on this surface. Even then the blast radius is bounded — the
surface is sessionless and `connect-src 'none'`, so such code can compute but
cannot reach the session or the network (WebAssembly has no ambient DOM,
syscall, or network authority; it gets only what its JavaScript glue provides,
and that glue is bound by this same policy). Determining Phaser's requirement,
and thus the final preview policy, is a prerequisite spike in `PLAN.md`.

## Network and session

- **Network.** The preview surface is `connect-src 'none'` — it denies `fetch`,
  `XHR`, `WebSocket`, `EventSource`, and beacons, so learner code cannot
  originate network traffic. This is stricter than Web Lab, which allows a
  host-configured allow-list; World Lab has no network story and grants none.
  The compile surface is `connect-src 'self'` for the single purpose of loading
  its own same-origin `esbuild.wasm`; since no learner code runs there, the
  learner still cannot originate traffic. A service worker on the sandbox origin
  (the one used for transport, below) additionally refuses any stray request
  that escapes the CSP, and reports it.
- **Session.** The sandbox origin carries no cookies and no shared storage with
  the lab. Cross-origin isolation prevents reading the lab's storage or DOM.
- **Page takeover.** `frame-ancestors` restricts who may embed the preview;
  `form-action 'none'` blocks form-driven navigation; the lab embeds the sandbox
  in an iframe it controls and never the reverse.

## Transport between the surfaces

The compiled module must travel from the compile surface to the preview surface.
Because both are same-origin, this is a local hand-off, not a cross-origin
concession:

- **Preferred:** a service worker on the sandbox origin holds the compiled
  module in memory (the mechanism Web Lab already uses to serve project files)
  and answers a self-origin URL for it; the preview `import()`s that URL. This
  keeps the preview's `script-src` at `'self'`, gives real module URLs for
  stack traces and source maps, and keeps the compiled bytes off the lab origin.
- **Fallback:** the compile surface posts the module text to the preview over a
  same-origin channel and the preview imports it from a `blob:` URL. This costs
  a `blob:` in the preview's `script-src` and yields blob-URL stack traces; it
  is used only if the service-worker hand-off proves impractical.

Either way, the bulk payload does not pass through the lab; only a URL or a
short control message crosses the lab boundary.

## Communication with the lab

All communication between the lab and the sandbox surfaces is by `postMessage`,
across the origin boundary. Every message is checked against the expected origin
on receipt, and every send is addressed to a specific origin — never `'*'`. The
message surfaces (compile control, preview control, and the preview's reports —
console output, engine errors, lifecycle) are enumerated in `PLAN.md`. Debugging
output (a learner `console.log`, an engine error) reaches the editor only over
this channel; the sandbox never writes to the lab's DOM directly.

## Production versus demo origins

Production gives each project its own sandbox subdomain, so projects are
isolated from one another as well as from the lab. The standalone demo uses a
single sandbox origin (a second local port) to avoid wildcard DNS; this is
weaker — it does not isolate one project from another — and is called out as
such in the README. The origin is host-supplied (a URL parameter or an explicit
setter), never hard-coded, so the demo's single origin and production's
per-project subdomains use the same code path.
