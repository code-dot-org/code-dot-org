// Node globals that webpack injects into apps' browser bundles
// (apps/webpack.config.js: node.global plus ProvidePlugin for process/browser).
// Only what the deep dive's dependency closure actually reads —
// @code-dot-org/redactable-markdown, reached through SafeMarkdown, is the one
// that needs `process`.
//
// Imported first from main.tsx so it runs before any apps module evaluates.

const globals = globalThis as unknown as Record<string, unknown>;

globals.global ??= globalThis;
globals.process ??= {
  env: {NODE_ENV: 'development'},
  browser: true,
  nextTick: (callback: () => void) => queueMicrotask(callback),
};

export {};
