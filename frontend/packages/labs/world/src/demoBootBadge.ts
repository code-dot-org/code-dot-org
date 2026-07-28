// Demo-only boot-time readout. `main.tsx` (the standalone harness) mounts this;
// it is never part of the library build. It reads the `performance.mark`s the
// runtime emits (world:compile-start/done, world:running) and prints the boot
// timeline into a small fixed badge — so the boot time is visible WITHOUT
// opening DevTools (needed because HAR/Network capture forces DevTools open, and
// we wanted to rule out DevTools' effect on the numbers).
//
// The `esbuild compile` line is the compile-surface bundle span, which measures
// as the single dominant boot cost. Compare it across browsers and across the
// `?world-esbuild-worker=1` toggle (esbuild on a Web Worker vs the main thread).

const round = (ms: number) => Math.round(ms);

function mark(name: string): number | null {
  const entries = performance.getEntriesByName(name);
  return entries.length ? entries[0].startTime : null;
}

export function mountBootBadge(): void {
  const badge = document.createElement('div');
  badge.setAttribute('data-world-boot-badge', '');
  Object.assign(badge.style, {
    position: 'fixed',
    bottom: '8px',
    left: '8px',
    zIndex: '99999',
    font: '12px/1.4 ui-monospace, monospace',
    background: 'rgba(0,0,0,0.78)',
    color: '#eaeaea',
    padding: '6px 9px',
    borderRadius: '6px',
    pointerEvents: 'none',
    whiteSpace: 'pre',
  } as Partial<CSSStyleDeclaration>);
  badge.textContent = 'boot: measuring…';
  document.body.appendChild(badge);

  const started = performance.now();
  const timer = window.setInterval(() => {
    const running = mark('world:running');
    const compileStart = mark('world:compile-start');
    const compileDone = mark('world:compile-done');
    if (running == null) {
      // Still booting — show elapsed so a stall is visible live.
      badge.textContent = `boot: …${round(performance.now())}ms`;
      // Give up the live counter after 60s to avoid a runaway interval.
      if (performance.now() - started > 60_000) {
        window.clearInterval(timer);
      }
      return;
    }
    window.clearInterval(timer);
    const compile =
      compileStart != null && compileDone != null
        ? round(compileDone - compileStart)
        : null;
    // Default is worker-on; only `world-esbuild-worker=0`/`false` forces off.
    const override = new URLSearchParams(location.search).get(
      'world-esbuild-worker',
    );
    const workerOn = override !== '0' && override !== 'false';
    const lines = [
      `boot to running: ${round(running)}ms`,
      compile != null ? `  esbuild compile: ${compile}ms` : '',
      `  esbuild worker: ${workerOn ? 'on' : 'off (main thread)'}`,
    ].filter(Boolean);
    badge.textContent = lines.join('\n');
  }, 200);
}
