import {mount} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import BackToFrontConfetti from '@cdo/apps/templates/BackToFrontConfetti';

import {expect} from '../../util/deprecatedChai';

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
    expect(wrapper).to.have.style('zIndex', '-1');
  });

  it('remains negatively zIndexed indefinitely after rendering', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    clock.tick(999);
    expect(wrapper).to.have.style('zIndex', '-1');
  });

  it('remains negatively zIndexed temporarily after activation', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    wrapper.setProps({active: true});
    expect(wrapper).to.have.style('zIndex', '-1');
    clock.tick(10);
    expect(wrapper).to.have.style('zIndex', '-1');
  });

  it('switches to a positive zIndex shortly after activation', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    wrapper.setProps({active: true});
    clock.tick(600);
    expect(wrapper).to.have.style('zIndex', '-1');
    clock.tick(100);
    expect(wrapper).to.have.style('zIndex', '1');
  });
});
