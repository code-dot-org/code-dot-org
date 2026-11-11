import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useRef} from 'react';

import BackToTop, {
  BACK_TO_TOP_SCROLL_THRESHOLD_PX,
} from '@cdo/apps/quiz/attempt/results/BackToTop';

const Harness: React.FunctionComponent = () => {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  return (
    <>
      <section aria-label="Quiz results" ref={scrollContainerRef}>
        <h2 tabIndex={-1} ref={headingRef}>
          Results
        </h2>
      </section>
      <BackToTop
        scrollContainerRef={scrollContainerRef}
        focusTargetRef={headingRef}
      />
    </>
  );
};

function scrollTo(scroller: HTMLElement, scrollTop: number) {
  Object.defineProperty(scroller, 'scrollTop', {
    configurable: true,
    value: scrollTop,
  });
  act(() => {
    fireEvent.scroll(scroller);
  });
}

describe('BackToTop', () => {
  it('stays hidden until the results are scrolled past the threshold', () => {
    render(<Harness />);
    const scroller = screen.getByRole('region', {name: 'Quiz results'});

    expect(
      screen.queryByRole('button', {name: 'Back to top'})
    ).not.toBeInTheDocument();

    scrollTo(scroller, BACK_TO_TOP_SCROLL_THRESHOLD_PX);
    expect(
      screen.queryByRole('button', {name: 'Back to top'})
    ).not.toBeInTheDocument();

    scrollTo(scroller, BACK_TO_TOP_SCROLL_THRESHOLD_PX + 1);
    expect(
      screen.getByRole('button', {name: 'Back to top'})
    ).toBeInTheDocument();

    scrollTo(scroller, 0);
    expect(
      screen.queryByRole('button', {name: 'Back to top'})
    ).not.toBeInTheDocument();
  });

  it('scrolls the results to the top and moves focus to the heading on click', () => {
    render(<Harness />);
    const scroller = screen.getByRole('region', {name: 'Quiz results'});
    scroller.scrollTo = jest.fn();

    scrollTo(scroller, BACK_TO_TOP_SCROLL_THRESHOLD_PX + 1);
    fireEvent.click(screen.getByRole('button', {name: 'Back to top'}));

    expect(scroller.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({top: 0})
    );
    expect(screen.getByRole('heading', {name: 'Results'})).toHaveFocus();
  });
});
