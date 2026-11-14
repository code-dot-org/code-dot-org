import {Diagnostic} from '@codemirror/lint';

import {getHtmlLintDiagnostics} from '@cdo/apps/weblab2/htmlLintDiagnostics';
import {
  createHtmlLintRunner,
  HtmlLintRequest,
} from '@cdo/apps/weblab2/htmlLinter';

jest.mock('@cdo/apps/weblab2/createHtmlLintWorker', () => ({
  createHtmlLintWorker: jest.fn(),
}));

const TIMEOUT_MS = 1000;

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  requests: HtmlLintRequest[] = [];
  terminate = jest.fn();

  postMessage(request: HtmlLintRequest) {
    this.requests.push(request);
  }

  reply(request: HtmlLintRequest, diagnostics: Diagnostic[]) {
    this.onmessage?.({data: {id: request.id, diagnostics}} as MessageEvent);
  }

  replyWithLint(request: HtmlLintRequest) {
    this.reply(request, getHtmlLintDiagnostics(request.source));
  }
}

const setUp = () => {
  const workers: FakeWorker[] = [];
  const createWorker = jest.fn(() => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker as unknown as Worker;
  });
  const onTimeout = jest.fn();
  const runHtmlLint = createHtmlLintRunner(createWorker, TIMEOUT_MS, onTimeout);
  return {workers, createWorker, onTimeout, runHtmlLint};
};

describe('createHtmlLintRunner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves with the diagnostics the worker returns', async () => {
    const {workers, runHtmlLint} = setUp();

    const result = runHtmlLint('<p class=pink>Pink</p>');
    workers[0].replyWithLint(workers[0].requests[0]);

    expect(await result).toEqual([
      expect.objectContaining({
        message: expect.stringContaining('must be in double quotes'),
      }),
    ]);
  });

  it('matches responses to requests by id', async () => {
    const {workers, runHtmlLint} = setUp();
    const first = runHtmlLint('first');
    const second = runHtmlLint('second');
    const [firstRequest, secondRequest] = workers[0].requests;
    const firstDiagnostic: Diagnostic = {
      from: 0,
      to: 0,
      severity: 'error',
      message: 'first',
    };
    const secondDiagnostic = {...firstDiagnostic, message: 'second'};

    workers[0].reply(secondRequest, [secondDiagnostic]);
    workers[0].reply(firstRequest, [firstDiagnostic]);

    expect(await first).toEqual([firstDiagnostic]);
    expect(await second).toEqual([secondDiagnostic]);
  });

  it('reuses one worker across calls', async () => {
    const {workers, createWorker, runHtmlLint} = setUp();

    const first = runHtmlLint('a');
    workers[0].reply(workers[0].requests[0], []);
    await first;
    const second = runHtmlLint('b');
    workers[0].reply(workers[0].requests[1], []);
    await second;

    expect(createWorker).toHaveBeenCalledTimes(1);
  });

  it('terminates a stuck worker and resolves every pending call with no diagnostics', async () => {
    const {workers, onTimeout, runHtmlLint} = setUp();
    const first = runHtmlLint('<t\n1 = 1');
    const second = runHtmlLint('<p></p>');

    jest.advanceTimersByTime(TIMEOUT_MS);

    expect(await first).toEqual([]);
    expect(await second).toEqual([]);
    expect(workers[0].terminate).toHaveBeenCalledTimes(1);
    expect(onTimeout).toHaveBeenCalled();
  });

  it('starts a fresh worker after a timeout', async () => {
    const {workers, createWorker, runHtmlLint} = setUp();
    const stuck = runHtmlLint('<t\n1 = 1');
    jest.advanceTimersByTime(TIMEOUT_MS);
    await stuck;

    const next = runHtmlLint('<p class=pink>Pink</p>');
    workers[1].replyWithLint(workers[1].requests[0]);

    expect(createWorker).toHaveBeenCalledTimes(2);
    expect(await next).toHaveLength(1);
  });

  it('does not time out a call the worker answered', async () => {
    const {workers, onTimeout, runHtmlLint} = setUp();
    const result = runHtmlLint('<p></p>');
    workers[0].reply(workers[0].requests[0], []);
    await result;

    jest.advanceTimersByTime(TIMEOUT_MS);

    expect(onTimeout).not.toHaveBeenCalled();
    expect(workers[0].terminate).not.toHaveBeenCalled();
  });

  it('resolves with no diagnostics when the worker errors', async () => {
    const {workers, runHtmlLint} = setUp();
    const result = runHtmlLint('<p></p>');

    workers[0].onerror?.({} as ErrorEvent);

    expect(await result).toEqual([]);
    expect(workers[0].terminate).toHaveBeenCalled();
  });

  it('resolves with no diagnostics when the worker cannot be created', async () => {
    const runHtmlLint = createHtmlLintRunner(() => {
      throw new Error('Workers unavailable');
    }, TIMEOUT_MS);

    expect(await runHtmlLint('<p></p>')).toEqual([]);
  });
});
