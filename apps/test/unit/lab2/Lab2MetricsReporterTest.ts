import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';

describe('Lab2MetricsReporter', () => {
  let logError: jest.SpyInstance;

  beforeEach(() => {
    logError = jest.spyOn(MetricsReporter, 'logError').mockImplementation();
  });

  const reportedError = () =>
    (logError.mock.calls[0][0] as {error?: string}).error;

  const errorWith = (message: string, stack?: string) => {
    const error = new Error(message);
    error.stack = stack;
    return error;
  };

  it('keeps a V8 stack as-is, since it already names the error', () => {
    const stack = 'Error: it broke\n    at capture (file.ts:1:1)';
    new Lab2MetricsReporter().logError('Snapshot error', errorWith(
      'it broke',
      stack
    ));

    expect(reportedError()).toBe(stack);
  });

  it('prepends the message to a Safari stack, which omits it', () => {
    new Lab2MetricsReporter().logError(
      'Snapshot error',
      errorWith('it broke', 'capture@file.ts:1:1\nstep@file.ts:2:2')
    );

    expect(reportedError()).toBe(
      'it broke\ncapture@file.ts:1:1\nstep@file.ts:2:2'
    );
  });

  it('falls back to the message when there is no stack', () => {
    new Lab2MetricsReporter().logError(
      'Snapshot error',
      errorWith('it broke', undefined)
    );

    expect(reportedError()).toBe('it broke');
  });
});
