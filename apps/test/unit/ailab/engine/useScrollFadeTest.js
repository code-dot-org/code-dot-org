import {act, render} from '@testing-library/react';
import {createElement, useRef} from 'react';

import {useScrollFade} from '@cdo/apps/ailab/engine/useScrollFade';

const Scroller = () => {
  const ref = useRef(null);
  useScrollFade(ref);
  return createElement(
    'div',
    {'data-testid': 'wrapper'},
    createElement('div', {ref, 'data-testid': 'scroller'})
  );
};

function sizeScroller(scroller, {scrollHeight, clientHeight, scrollTop}) {
  Object.defineProperty(scroller, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(scroller, 'clientHeight', {
    value: clientHeight,
    configurable: true,
  });
  scroller.scrollTop = scrollTop;
}

describe('useScrollFade', () => {
  it('fades only the bottom edge when the list starts scrolled to the top', () => {
    const {getByTestId} = render(createElement(Scroller));
    const wrapper = getByTestId('wrapper');
    const scroller = getByTestId('scroller');

    sizeScroller(scroller, {
      scrollHeight: 500,
      clientHeight: 200,
      scrollTop: 0,
    });
    act(() => {
      scroller.dispatchEvent(new Event('scroll'));
    });

    expect(wrapper).not.toHaveAttribute('data-fade-top');
    expect(wrapper).toHaveAttribute('data-fade-bottom');
  });

  it('fades both edges mid-list and only the top at the end', () => {
    const {getByTestId} = render(createElement(Scroller));
    const wrapper = getByTestId('wrapper');
    const scroller = getByTestId('scroller');

    sizeScroller(scroller, {
      scrollHeight: 500,
      clientHeight: 200,
      scrollTop: 100,
    });
    act(() => {
      scroller.dispatchEvent(new Event('scroll'));
    });
    expect(wrapper).toHaveAttribute('data-fade-top');
    expect(wrapper).toHaveAttribute('data-fade-bottom');

    sizeScroller(scroller, {
      scrollHeight: 500,
      clientHeight: 200,
      scrollTop: 300,
    });
    act(() => {
      scroller.dispatchEvent(new Event('scroll'));
    });
    expect(wrapper).toHaveAttribute('data-fade-top');
    expect(wrapper).not.toHaveAttribute('data-fade-bottom');
  });

  it('does not fade a list that fits', () => {
    const {getByTestId} = render(createElement(Scroller));
    const wrapper = getByTestId('wrapper');
    const scroller = getByTestId('scroller');

    sizeScroller(scroller, {
      scrollHeight: 200,
      clientHeight: 200,
      scrollTop: 0,
    });
    act(() => {
      scroller.dispatchEvent(new Event('scroll'));
    });

    expect(wrapper).not.toHaveAttribute('data-fade-top');
    expect(wrapper).not.toHaveAttribute('data-fade-bottom');
  });
});
