jest.mock('@code-dot-org/core/plugins/observability', () => ({
  metrics: {count: jest.fn(), distribution: jest.fn(), gauge: jest.fn()},
  logger: {error: jest.fn(), warn: jest.fn(), info: jest.fn()},
}));

import * as Observability from '@code-dot-org/core/plugins/observability';

import {
  classifyTurnstileFailure,
  recordTurnstileOutcome,
} from '@cdo/apps/aiGateway/turnstile/outcome';
import {
  TurnstileChallengeError,
  TurnstileDevToolsError,
  type TurnstileFailureReason,
} from '@cdo/apps/aiGateway/turnstile/types';
import {
  turnstileErrorTags,
  turnstileUserMessage,
} from '@cdo/apps/aiGateway/turnstile/util';

const countMock = Observability.metrics.count as jest.Mock;
const distributionMock = Observability.metrics.distribution as jest.Mock;
const loggerErrorMock = Observability.logger.error as jest.Mock;
const loggerWarnMock = Observability.logger.warn as jest.Mock;

beforeEach(() => {
  countMock.mockClear();
  distributionMock.mockClear();
  loggerErrorMock.mockClear();
  loggerWarnMock.mockClear();
});

describe('classifyTurnstileFailure', () => {
  it('reads the reason off a challenge error', () => {
    expect(
      classifyTurnstileFailure(
        new TurnstileChallengeError('timeout', 'timed out')
      )
    ).toBe('timeout');
  });

  it('falls back to unknown for errors thrown outside the challenge', () => {
    expect(classifyTurnstileFailure(new Error('something else'))).toBe(
      'unknown'
    );
    expect(classifyTurnstileFailure('not an error')).toBe('unknown');
  });
});

describe('recordTurnstileOutcome', () => {
  it('counts a success under result "ok" with no reason attribute', () => {
    recordTurnstileOutcome({
      acquisitionMode: 'on-demand',
      enforcementMode: 'enforce',
      durationMs: 1234.6,
    });

    expect(countMock).toHaveBeenCalledWith('ai-gateway.turnstile', 1, {
      acquisition_mode: 'on-demand',
      enforcement_mode: 'enforce',
      result: 'ok',
    });
    expect(distributionMock).toHaveBeenCalledWith(
      'ai-gateway.turnstile.duration_ms',
      1235,
      {acquisition_mode: 'on-demand', enforcement_mode: 'enforce', result: 'ok'}
    );
    expect(loggerErrorMock).not.toHaveBeenCalled();
    expect(loggerWarnMock).not.toHaveBeenCalled();
  });

  it('counts a failure under result "error" carrying the reason', () => {
    recordTurnstileOutcome({
      acquisitionMode: 'pre-fetch',
      enforcementMode: 'enforce',
      durationMs: 30_000,
      error: new TurnstileChallengeError('timeout', 'timed out'),
    });

    expect(countMock).toHaveBeenCalledWith('ai-gateway.turnstile', 1, {
      acquisition_mode: 'pre-fetch',
      enforcement_mode: 'enforce',
      result: 'error',
      reason: 'timeout',
    });
  });

  // The enforcement mode is what separates a tolerated measurement from a
  // broken request. Without it on the series, a failure count cannot be read.
  it('carries the enforcement mode as a separate dimension from acquisition', () => {
    recordTurnstileOutcome({
      acquisitionMode: 'pre-fetch',
      enforcementMode: 'monitor',
      durationMs: 10,
    });

    expect(countMock).toHaveBeenCalledWith(
      'ai-gateway.turnstile',
      1,
      expect.objectContaining({
        acquisition_mode: 'pre-fetch',
        enforcement_mode: 'monitor',
      })
    );
  });

  it('logs failures at 100% with the attributes the metric cannot carry', () => {
    recordTurnstileOutcome({
      acquisitionMode: 'on-demand',
      enforcementMode: 'enforce',
      durationMs: 42,
      error: new TurnstileChallengeError('render_failed', 'no widget id'),
    });

    expect(loggerErrorMock).toHaveBeenCalledWith(
      'turnstile challenge failed',
      expect.objectContaining({
        feature: 'ai-gateway',
        acquisition_mode: 'on-demand',
        enforcement_mode: 'enforce',
        reason: 'render_failed',
        durationMs: 42,
        errorMessage: 'no widget id',
      })
    );
  });

  // Under monitor the request still succeeds without a token, so this is not
  // an error. Logging it as one would fill the error stream during exactly the
  // phase the rollout is measuring.
  it('logs a monitor-mode failure at warn rather than error', () => {
    recordTurnstileOutcome({
      acquisitionMode: 'on-demand',
      enforcementMode: 'monitor',
      durationMs: 42,
      error: new TurnstileChallengeError('timeout', 'timed out'),
    });

    expect(loggerWarnMock).toHaveBeenCalledWith(
      'turnstile challenge failed',
      expect.objectContaining({enforcement_mode: 'monitor', reason: 'timeout'})
    );
    expect(loggerErrorMock).not.toHaveBeenCalled();
  });

  it('records the duration for failures so timeouts are visible in p95', () => {
    recordTurnstileOutcome({
      acquisitionMode: 'on-demand',
      enforcementMode: 'enforce',
      durationMs: 30_000,
      error: new TurnstileChallengeError('timeout', 'timed out'),
    });

    expect(distributionMock).toHaveBeenCalledWith(
      'ai-gateway.turnstile.duration_ms',
      30_000,
      {
        acquisition_mode: 'on-demand',
        enforcement_mode: 'enforce',
        result: 'error',
      }
    );
  });
});

describe('turnstileErrorTags', () => {
  it('distinguishes timeouts from other challenge failures', () => {
    expect(
      turnstileErrorTags(new TurnstileChallengeError('timeout', 'timed out'))
    ).toEqual({'error.category': 'turnstile_timeout'});
    expect(
      turnstileErrorTags(
        new TurnstileChallengeError('script_load_failed', 'no script')
      )
    ).toEqual({'error.category': 'turnstile_failed'});
  });

  it('returns undefined for errors that are not challenge failures', () => {
    expect(turnstileErrorTags(new Error('network'))).toBeUndefined();
    expect(turnstileErrorTags(new TurnstileDevToolsError())).toBeUndefined();
  });
});

describe('turnstileUserMessage', () => {
  // Grouped by what the reader can do, not by reason: a student cannot act
  // differently on render_threw than on challenge_failed.
  it.each<TurnstileFailureReason>(['script_load_failed', 'timeout'])(
    'tells the reader something may be blocking the check for %s',
    reason => {
      const message = turnstileUserMessage(
        new TurnstileChallengeError(reason, 'nope')
      );

      expect(message).toMatch(/blocking/i);
      expect(message).toMatch(/reload/i);
    }
  );

  it('names the browser as the problem when unsupported', () => {
    const message = turnstileUserMessage(
      new TurnstileChallengeError('unsupported', 'nope')
    );

    expect(message).toMatch(/browser/i);
  });

  it.each<TurnstileFailureReason>([
    'challenge_failed',
    'render_threw',
    'render_failed',
    'remove_failed',
    'unknown',
  ])('falls back to reload-and-retry for %s', reason => {
    const message = turnstileUserMessage(
      new TurnstileChallengeError(reason, 'nope')
    );

    expect(message).toMatch(/reload/i);
    expect(message).not.toMatch(/browser/i);
  });

  it('returns undefined for errors that are not challenge failures', () => {
    expect(turnstileUserMessage(new Error('network'))).toBeUndefined();
    expect(turnstileUserMessage('not an error')).toBeUndefined();
  });

  // The DevTools case has its own targeted help text, and the caller checks
  // this helper first -- so it must decline to claim that error.
  it('leaves the DevTools error to its own handler', () => {
    expect(turnstileUserMessage(new TurnstileDevToolsError())).toBeUndefined();
  });
});
