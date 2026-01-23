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

  it('remains negatively zIndexed indefinitely after rendering', async () => {
    const wrapper = mount(<BackToFrontConfetti />);
    await act(async () => {
      jest.advanceTimersByTime(999);
    });
    wrapper.update();
    expect(wrapper).to.have.style('zIndex', '-1');
  });

  it('remains negatively zIndexed temporarily after activation', async () => {
    const wrapper = mount(<BackToFrontConfetti />);
    await act(async () => {
      wrapper.setProps({active: true});
    });
    wrapper.update();
    expect(wrapper).to.have.style('zIndex', '-1');
    await act(async () => {
      jest.advanceTimersByTime(10);
    });
    wrapper.update();
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
