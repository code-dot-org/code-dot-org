import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import BackToFrontConfetti from '@cdo/apps/templates/BackToFrontConfetti';

import {expect} from '../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

describe('BackToFrontConfetti', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initially renders with a negative zIndex', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    expect(wrapper).to.have.style('zIndex', '-1');
  });

  it('remains negatively zIndexed indefinitely after rendering', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    jest.advanceTimersByTime(999);
    expect(wrapper).to.have.style('zIndex', '-1');
  });

  it('remains negatively zIndexed temporarily after activation', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    wrapper.setProps({active: true});
    expect(wrapper).to.have.style('zIndex', '-1');
    jest.advanceTimersByTime(10);
    expect(wrapper).to.have.style('zIndex', '-1');
  });

  it('switches to a positive zIndex shortly after activation', () => {
    const wrapper = mount(<BackToFrontConfetti />);
    wrapper.setProps({active: true});
    jest.advanceTimersByTime(600);
    expect(wrapper).to.have.style('zIndex', '-1');
    jest.advanceTimersByTime(100);
    expect(wrapper).to.have.style('zIndex', '1');
  });
});
