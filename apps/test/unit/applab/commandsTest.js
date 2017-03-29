import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import {rgb, timedLoop, stopTimedLoop} from '@cdo/apps/applab/commands';

describe("rgb command", () => {
  it('returns an rgba string with no alpha', function () {
    const opts = {r: 255, g: 0, b: 75};
    expect(rgb(opts)).to.equal("rgba(255, 0, 75, 1)");
  });

  it('returns an rgba string with alpha', function () {
    const alphaOpts = {r: 255, g: 0, b: 75, a: 0.5};
    expect(rgb(alphaOpts)).to.equal("rgba(255, 0, 75, 0.5)");
  });

  it('handles values outside of 0 - 255', function () {
    const alphaOpts = {r: -10, g: 300, b: 75, a: 0.5};
    expect(rgb(alphaOpts)).to.equal("rgba(0, 255, 75, 0.5)");
  });

  it('handles decimal values', function () {
    const alphaOpts = {r: 0, g: 200.5, b: 75, a: 0.5};
    expect(rgb(alphaOpts)).to.equal("rgba(0, 201, 75, 0.5)");
  });
});

describe('timedLoop({ms, callback})', () => {
  it('runs code on an interval', () => {
    const clock = sinon.useFakeTimers();

    const spy = sinon.spy();
    timedLoop({ ms: 50, callback: spy });
    expect(spy).not.to.have.been.called;

    clock.tick(49);
    expect(spy).not.to.have.been.called;

    clock.tick(1);
    expect(spy).to.have.been.calledOnce;

    clock.tick(50);
    expect(spy).to.have.been.calledTwice;

    stopTimedLoop({});
    clock.tick(50);
    expect(spy).to.have.been.calledTwice;

    clock.restore();
  });
});
