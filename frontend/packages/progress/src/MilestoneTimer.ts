// Time on a level since the last milestone, less the time the user was idle.
// The server stores it as UserLevel#time_spent.

export class MilestoneTimer {
  private readonly now: () => number;
  private milestoneStartTime: number;
  private idleStartTime: number | null = null;
  private accumulatedIdleTime = 0;

  // Looked up per call, not bound at construction, so a replaced Date.now
  // (a test's fake clock) reaches the module-level instance.
  constructor(now: () => number = () => Date.now()) {
    this.now = now;
    this.milestoneStartTime = this.now();
  }

  resetMilestoneTimer() {
    this.milestoneStartTime = this.now();
    this.idleStartTime = null;
    this.accumulatedIdleTime = 0;
  }

  startIdle() {
    if (this.idleStartTime === null) {
      this.idleStartTime = this.now();
    }
  }

  endIdle() {
    if (this.idleStartTime !== null) {
      this.accumulatedIdleTime += this.now() - this.idleStartTime;
      this.idleStartTime = null;
    }
  }

  /** Milliseconds, as the milestone route expects. */
  getTimeSinceLastMilestone(): number {
    const now = this.now();
    const currentIdle =
      this.idleStartTime === null ? 0 : now - this.idleStartTime;
    return (
      now - this.milestoneStartTime - (this.accumulatedIdleTime + currentIdle)
    );
  }
}

/**
 * The timer milestone posts read. The host resets it when it mounts a lab and
 * reports idleness through startIdle and endIdle; the progress thunks reset
 * it after each successful post and each in-page level change.
 */
export const milestoneTimer = new MilestoneTimer();
