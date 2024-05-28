import sinon from 'sinon';

import {
  getResponsiveBreakpoint,
  ResponsiveSize,
} from '@cdo/apps/code-studio/responsiveRedux';

import {expect} from '../../util/reconfiguredChai';

describe('responsiveRedux', () => {
  it('getResponsiveBreakpoint returns lg', () => {
    expect(getResponsiveBreakpoint(1000)).to.equal(ResponsiveSize.lg);
  });
  it('getResponsiveBreakpoint returns md', () => {
    expect(getResponsiveBreakpoint(800)).to.equal(ResponsiveSize.md);
  });
  it('getResponsiveBreakpoint returns sm', () => {
    expect(getResponsiveBreakpoint(700)).to.equal(ResponsiveSize.sm);
  });
  it('getResponsiveBreakpoint returns xs', () => {
    expect(getResponsiveBreakpoint(500)).to.equal(ResponsiveSize.xs);
  });
  it('getResponsiveBreakpoint returns xs if 0', () => {
    sinon.stub(console, 'error');
    expect(getResponsiveBreakpoint(0)).to.equal(ResponsiveSize.xs);
    expect(console.error).to.have.been.calledOnce;
  });
});
