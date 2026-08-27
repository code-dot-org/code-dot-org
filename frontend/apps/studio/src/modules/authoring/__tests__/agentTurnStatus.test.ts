import {describe, expect, it} from 'vitest';

import {computeFinishedTurns, findActiveTurn} from '../agentTurnStatus';
import type {AuthoringServerEvent} from '../events';

function status(
  turnId: string,
  turnStatus: 'started' | 'tool' | 'text' | 'done' | 'error',
  detail?: string,
): AuthoringServerEvent {
  return {
    type: 'agent-status',
    turnId,
    status: turnStatus,
    ...(detail ? {detail} : {}),
  };
}

describe('computeFinishedTurns', () => {
  it('collects turnIds whose latest status is done or error', () => {
    const feed = [status('a', 'started'), status('b', 'done'), status('c', 'error')];
    expect(computeFinishedTurns(feed)).toEqual(new Set(['b', 'c']));
  });

  it('ignores non-agent-status events', () => {
    const feed: AuthoringServerEvent[] = [{type: 'state', version: 1}];
    expect(computeFinishedTurns(feed)).toEqual(new Set());
  });
});

describe('findActiveTurn', () => {
  it('returns undefined when no turn has started', () => {
    expect(findActiveTurn([])).toBeUndefined();
  });

  it('returns the in-flight turn while its status is started/tool/text', () => {
    const feed = [
      status('a', 'started'),
      status('a', 'tool', 'search_existing_levels: bee puzzle'),
    ];
    expect(findActiveTurn(feed)?.turnId).toBe('a');
  });

  it('clears once the turn reaches done', () => {
    const feed = [status('a', 'started'), status('a', 'tool'), status('a', 'done')];
    expect(findActiveTurn(feed)).toBeUndefined();
  });

  it('clears once the turn reaches error', () => {
    const feed = [status('a', 'started'), status('a', 'error', 'boom')];
    expect(findActiveTurn(feed)).toBeUndefined();
  });

  it('reports a later turn as active after an earlier one finished', () => {
    const feed = [
      status('a', 'started'),
      status('a', 'done'),
      status('b', 'started'),
    ];
    expect(findActiveTurn(feed)?.turnId).toBe('b');
  });
});
