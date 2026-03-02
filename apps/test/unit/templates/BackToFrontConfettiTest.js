import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {act} from 'react-dom/test-utils';

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

  it('switches to a positive zIndex shortly after activation', async () => {
    const wrapper = mount(<BackToFrontConfetti />);
    await act(async () => {
      wrapper.setProps({active: true});
    });
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    wrapper.update();
    expect(wrapper).to.have.style('zIndex', '-1');
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    wrapper.update();
    expect(wrapper).to.have.style('zIndex', '1');
  });
});
