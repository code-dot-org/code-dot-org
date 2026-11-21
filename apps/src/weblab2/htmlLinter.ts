import {Diagnostic, linter} from '@codemirror/lint';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {createHtmlLintWorker} from './createHtmlLintWorker';

// HTMLHint's tag regex backtracks exponentially on some unclosed tags (e.g.
// "<t" followed by many "a = b" lines), and a running regex cannot be
// interrupted. Lint in a worker so a stuck run can be terminated.

export interface HtmlLintRequest {
  id: number;
  source: string;
}

export interface HtmlLintResponse {
  id: number;
  diagnostics: Diagnostic[];
}

export const HTML_LINT_TIMEOUT_MS = 1000;

interface PendingRequest {
  resolve: (diagnostics: Diagnostic[]) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

// Returns a lint function that resolves to no diagnostics when the worker
// fails or exceeds timeoutMs.
export const createHtmlLintRunner = (
  createWorker: () => Worker,
  timeoutMs: number,
  onTimeout: () => void = () => {}
) => {
  let worker: Worker | undefined;
  let nextId = 0;
  const pending = new Map<number, PendingRequest>();

  const discardWorker = () => {
    worker?.terminate();
    worker = undefined;
    pending.forEach(({resolve, timeoutId}) => {
      clearTimeout(timeoutId);
      resolve([]);
    });
    pending.clear();
  };

  const getWorker = (): Worker => {
    if (worker) {
      return worker;
    }
    const newWorker = createWorker();
    newWorker.onmessage = (event: MessageEvent<HtmlLintResponse>) => {
      const request = pending.get(event.data.id);
      if (!request) {
        return;
      }
      clearTimeout(request.timeoutId);
      pending.delete(event.data.id);
      request.resolve(event.data.diagnostics);
    };
    newWorker.onerror = () => {
      if (worker === newWorker) {
        discardWorker();
      }
    };
    worker = newWorker;
    return newWorker;
  };

  return (source: string): Promise<Diagnostic[]> =>
    new Promise(resolve => {
      let lintWorker: Worker;
      try {
        lintWorker = getWorker();
      } catch {
        resolve([]);
        return;
      }
      const id = nextId++;
      const timeoutId = setTimeout(() => {
        onTimeout();
        discardWorker();
      }, timeoutMs);
      pending.set(id, {resolve, timeoutId});
      const request: HtmlLintRequest = {id, source};
      lintWorker.postMessage(request);
    });
};

const runHtmlLint = createHtmlLintRunner(
  createHtmlLintWorker,
  HTML_LINT_TIMEOUT_MS,
  () =>
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logWarning(`HTML lint exceeded ${HTML_LINT_TIMEOUT_MS}ms; skipped.`)
);

export const htmlLinter = linter(view =>
  runHtmlLint(view.state.doc.toString())
);
