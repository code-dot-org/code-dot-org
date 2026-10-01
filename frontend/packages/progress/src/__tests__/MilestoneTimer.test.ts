import {describe, expect, it} from 'vitest';

import {MilestoneTimer} from '../MilestoneTimer';

function timerAt(start = 1000) {
  let now = start;
  const timer = new MilestoneTimer(() => now);
  return {timer, advance: (ms: number) => (now += ms)};
}

describe('MilestoneTimer', () => {
  it('counts from construction', () => {
    const {timer, advance} = timerAt();
    advance(5000);
    expect(timer.getTimeSinceLastMilestone()).toBe(5000);
  });

  it('counts from the last reset', () => {
    const {timer, advance} = timerAt();
    advance(5000);
    timer.resetMilestoneTimer();
    advance(2000);
    expect(timer.getTimeSinceLastMilestone()).toBe(2000);
  });

  it('subtracts completed idle periods', () => {
    const {timer, advance} = timerAt();
    advance(1000);
    timer.startIdle();
    advance(3000);
    timer.endIdle();
    advance(1000);
    timer.startIdle();
    advance(500);
    timer.endIdle();
    expect(timer.getTimeSinceLastMilestone()).toBe(2000);
  });

  it('subtracts an idle period still in progress', () => {
    const {timer, advance} = timerAt();
    advance(1000);
    timer.startIdle();
    advance(4000);
    expect(timer.getTimeSinceLastMilestone()).toBe(1000);
  });

  it('ignores a repeated startIdle and a stray endIdle', () => {
    const {timer, advance} = timerAt();
    timer.endIdle();
    advance(1000);
    timer.startIdle();
    advance(1000);
    timer.startIdle();
    advance(1000);
    timer.endIdle();
    expect(timer.getTimeSinceLastMilestone()).toBe(1000);
  });

  it('forgets idle time on reset', () => {
    const {timer, advance} = timerAt();
    timer.startIdle();
    advance(3000);
    timer.resetMilestoneTimer();
    advance(1000);
    expect(timer.getTimeSinceLastMilestone()).toBe(1000);
  });
});
