import sinon from 'sinon';
import {expect} from '../../../util/deprecatedChai';
import * as timeoutList from '@cdo/apps/lib/util/timeoutList';

describe('timeoutList', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  describe('setTimeout(fn, time)', () => {
    it('sets a timeout', () => {
      const spy = sinon.spy();
      timeoutList.setTimeout(spy, 100);
      expect(spy).not.to.have.been.called;
      clock.tick(100);
      expect(spy).to.have.been.calledOnce;
    });

    it('only happens once', () => {
      const spy = sinon.spy();
      timeoutList.setTimeout(spy, 100);
      clock.tick(300);
      expect(spy).to.have.been.calledOnce;
    });
  });

  describe('clearTimeout(id)', () => {
    it('stops a timeout from happening', () => {
      const spy = sinon.spy();
      const key = timeoutList.setTimeout(spy, 100);
      timeoutList.clearTimeout(key);
      clock.tick(100);
      expect(spy).not.to.have.been.called;
    });

    it('is a no-op if called after timeout occurs', () => {
      const spy = sinon.spy();
      const key = timeoutList.setTimeout(spy, 100);
      clock.tick(100);
      expect(spy).to.have.been.calledOnce;
      timeoutList.clearTimeout(key);
    });

    it('clears only one timeout according to given key', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const key1 = timeoutList.setTimeout(spy1, 100);
      timeoutList.setTimeout(spy2, 100);
      timeoutList.clearTimeout(key1);
      clock.tick(100);
      expect(spy1).not.to.have.been.called;
      expect(spy2).to.have.been.calledOnce;
    });
  });

  describe('clearTimeouts()', () => {
    it('stops all timeouts from happening', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      timeoutList.setTimeout(spy1, 100);
      timeoutList.setTimeout(spy2, 100);
      timeoutList.clearTimeouts();
      clock.tick(100);
      expect(spy1).not.to.have.been.called;
      expect(spy2).not.to.have.been.called;
    });

    it('is a no-op if no timeouts are set', () => {
      expect(() => timeoutList.clearTimeouts()).not.to.throw;
    });
  });

  describe('setInterval(fn, time)', () => {
    it('sets an interval', () => {
      const spy = sinon.spy();
      timeoutList.setInterval(spy, 100);
      expect(spy).not.to.have.been.called;
      clock.tick(100);
      expect(spy).to.have.been.calledOnce;
    });

    it('happens every [interval] ms', () => {
      const spy = sinon.spy();
      timeoutList.setInterval(spy, 100);
      clock.tick(300);
      expect(spy).to.have.been.calledThrice;
    });
  });

  describe('clearInterval(id)', () => {
    it('stops the interval from happening', () => {
      const spy = sinon.spy();
      const key = timeoutList.setInterval(spy, 100);
      clock.tick(100);
      expect(spy).to.have.been.calledOnce;
      timeoutList.clearInterval(key);
      clock.tick(100);
      expect(spy).to.have.been.calledOnce;
    });

    it('is a no-op if called on a bad key', () => {
      expect(() => timeoutList.clearInterval(42)).not.to.throw;
    });

    it('clears only one interval according to given key', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const key1 = timeoutList.setInterval(spy1, 100);
      timeoutList.setInterval(spy2, 100);
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledOnce;

      timeoutList.clearInterval(key1);
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledTwice;
    });
  });

  describe('clearIntervals()', () => {
    it('stops all intervals', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      timeoutList.setInterval(spy1, 100);
      timeoutList.setInterval(spy2, 100);
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledOnce;

      timeoutList.clearIntervals();
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledOnce;
    });

    it('also clears timedLoops', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      timeoutList.timedLoop(100, spy1);
      timeoutList.timedLoop(100, spy2);
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledOnce;

      timeoutList.clearIntervals();
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledOnce;
    });

    it('is a no-op if no intervals are set', () => {
      expect(() => timeoutList.clearIntervals()).not.to.throw;
    });
  });

  describe('timedLoop(interval, fn)', () => {
    it('runs code on an interval', () => {
      const spy = sinon.spy();
      timeoutList.timedLoop(100, spy);
      expect(spy).not.to.have.been.called;
      clock.tick(100);
      expect(spy).to.have.been.calledOnce;
    });

    it('happens every [interval] ms', () => {
      const spy = sinon.spy();
      timeoutList.timedLoop(100, spy);
      clock.tick(300);
      expect(spy).to.have.been.calledThrice;
    });
  });

  describe('stopTimedLoop([key])', () => {
    it('stops the loop from happening', () => {
      const spy = sinon.spy();
      timeoutList.timedLoop(100, spy);
      clock.tick(100);
      expect(spy).to.have.been.calledOnce;

      timeoutList.stopTimedLoop();
      clock.tick(100);
      expect(spy).to.have.been.calledOnce;
    });

    it('is a no-op if called when no timed loop is running', () => {
      expect(() => timeoutList.stopTimedLoop()).not.to.throw;
    });

    it('is a no-op if called on a bad key', () => {
      expect(() => timeoutList.stopTimedLoop(42)).not.to.throw;
    });

    it('clears only one loop if given a key', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const key1 = timeoutList.timedLoop(100, spy1);
      timeoutList.timedLoop(100, spy2);
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledOnce;

      timeoutList.stopTimedLoop(key1);
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledTwice;
    });

    it('clears all loops if called with no arguments', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      timeoutList.timedLoop(100, spy1);
      timeoutList.timedLoop(100, spy2);
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledOnce;

      timeoutList.stopTimedLoop();
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledOnce;
    });

    it('does not clear setInterval calls if called with no arguments', () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      timeoutList.timedLoop(100, spy1);
      timeoutList.setInterval(spy2, 100);
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledOnce;

      timeoutList.stopTimedLoop();
      clock.tick(100);
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).to.have.been.calledTwice;
    });
  });
});
