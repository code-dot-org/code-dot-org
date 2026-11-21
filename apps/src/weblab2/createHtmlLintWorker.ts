// Kept apart from htmlLinter.ts so Jest, which cannot parse import.meta, can mock it.
export const createHtmlLintWorker = (): Worker =>
  new Worker(
    /* webpackChunkName: "weblab2-html-lint-worker" */ new URL(
      './htmlLintWorker.ts',
      // @ts-expect-error because TypeScript does not like this syntax.
      import.meta.url
    )
  );
