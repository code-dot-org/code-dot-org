import sinon from 'sinon';
import BackToFrontConfetti from '@cdo/apps/templates/BackToFrontConfetti';
import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {mount} from 'enzyme';

function getZIndex(wrapper) {
  return wrapper
    .at(0)
    .childAt(0)
    .props().style.zIndex;
}

describe('BackToFrontConfetti', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('initially renders with a negative zIndex', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    expect(getZIndex(wrapper)).to.equal(-1);
  });

  it('remains negatively zIndexed indefinitely after rendering', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    clock.tick(999);
    expect(getZIndex(wrapper)).to.equal(-1);
  });

  it('remains negatively zIndexed temporarily after activation', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    wrapper.setProps({active: true});
    expect(getZIndex(wrapper)).to.equal(-1);
    clock.tick(10);
    expect(getZIndex(wrapper)).to.equal(-1);
  });

  it('switches to a positive zIndex shortly after activation', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    wrapper.setProps({active: true});
    clock.tick(600);
    expect(getZIndex(wrapper)).to.equal(-1);
    clock.tick(100);
    wrapper.setProps({}); // Force re-render
    expect(getZIndex(wrapper)).to.equal(1);
  });
});
