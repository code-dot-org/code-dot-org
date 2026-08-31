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
} from '@cdo/apps/aiGateway/turnstile/types';
import {turnstileErrorTags} from '@cdo/apps/aiGateway/turnstile/util';

const countMock = Observability.metrics.count as jest.Mock;
const distributionMock = Observability.metrics.distribution as jest.Mock;
const loggerErrorMock = Observability.logger.error as jest.Mock;

beforeEach(() => {
  countMock.mockClear();
  distributionMock.mockClear();
  loggerErrorMock.mockClear();
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
    recordTurnstileOutcome({mode: 'on-demand', durationMs: 1234.6});

    expect(countMock).toHaveBeenCalledWith('ai-gateway.turnstile', 1, {
      mode: 'on-demand',
      result: 'ok',
    });
    expect(distributionMock).toHaveBeenCalledWith(
      'ai-gateway.turnstile.duration_ms',
      1235,
      {mode: 'on-demand', result: 'ok'}
    );
    expect(loggerErrorMock).not.toHaveBeenCalled();
  });

  it('counts a failure under result "error" carrying the reason', () => {
    recordTurnstileOutcome({
      mode: 'pre-fetch',
      durationMs: 30_000,
      error: new TurnstileChallengeError('timeout', 'timed out'),
    });

    expect(countMock).toHaveBeenCalledWith('ai-gateway.turnstile', 1, {
      mode: 'pre-fetch',
      result: 'error',
      reason: 'timeout',
    });
  });

  it('logs failures at 100% with the attributes the metric cannot carry', () => {
    recordTurnstileOutcome({
      mode: 'on-demand',
      durationMs: 42,
      error: new TurnstileChallengeError('render_failed', 'no widget id'),
    });

    expect(loggerErrorMock).toHaveBeenCalledWith(
      'turnstile challenge failed',
      expect.objectContaining({
        feature: 'ai-gateway',
        mode: 'on-demand',
        reason: 'render_failed',
        durationMs: 42,
        errorMessage: 'no widget id',
      })
    );
  });

  it('records the duration for failures so timeouts are visible in p95', () => {
    recordTurnstileOutcome({
      mode: 'on-demand',
      durationMs: 30_000,
      error: new TurnstileChallengeError('timeout', 'timed out'),
    });

    expect(distributionMock).toHaveBeenCalledWith(
      'ai-gateway.turnstile.duration_ms',
      30_000,
      {mode: 'on-demand', result: 'error'}
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
