import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';

import RecapStoryCard from '../RecapStoryCard';

const GRADIENT = 'linear-gradient(to bottom, #EC4899, #F9C8DF)';
const DURATION = 5000;

function getSegments(currentSlide: number, totalSlides: number): HTMLElement[] {
  const {container} = render(
    <RecapStoryCard
      gradient={GRADIENT}
      lessonLabel="Test Lesson Recap"
      autoAdvanceDurationMs={DURATION}
      currentSlide={currentSlide}
      totalSlides={totalSlides}
    >
      <div>content</div>
    </RecapStoryCard>,
  );
  const tracker = container.querySelector('[aria-hidden="true"]')!;
  return Array.from(tracker.children) as HTMLElement[];
}

describe('RecapStoryCard progress tracker fill', () => {
  it('renders a fill div only in the current segment', () => {
    const segments = getSegments(3, 5);
    // past (0, 1) and future (3, 4) have no fill child
    expect(segments[0].children).toHaveLength(0);
    expect(segments[1].children).toHaveLength(0);
    expect(segments[3].children).toHaveLength(0);
    expect(segments[4].children).toHaveLength(0);
    // current (2) has the fill div
    expect(segments[2].children).toHaveLength(1);
  });

  it('sets animationDuration on the fill div from the prop', () => {
    const segments = getSegments(3, 5);
    const fill = segments[2].children[0] as HTMLElement;
    expect(fill.style.animationDuration).toBe(`${DURATION}ms`);
  });

  it('propagates a different autoAdvanceDurationMs correctly', () => {
    const {container} = render(
      <RecapStoryCard
        gradient={GRADIENT}
        lessonLabel="Test"
        autoAdvanceDurationMs={12000}
        currentSlide={1}
        totalSlides={3}
      >
        <div>content</div>
      </RecapStoryCard>,
    );
    const tracker = container.querySelector('[aria-hidden="true"]')!;
    const fill = (tracker.children[0] as HTMLElement)
      .children[0] as HTMLElement;
    expect(fill.style.animationDuration).toBe('12000ms');
  });

  it('renders the fill div on the last slide', () => {
    const segments = getSegments(5, 5);
    expect(segments[4].children).toHaveLength(1);
    expect(
      (segments[4].children[0] as HTMLElement).style.animationDuration,
    ).toBe(`${DURATION}ms`);
  });

  it('renders the fill div on the first slide', () => {
    const segments = getSegments(1, 5);
    expect(segments[0].children).toHaveLength(1);
    for (let i = 1; i < 5; i++) {
      expect(segments[i].children).toHaveLength(0);
    }
  });
});
