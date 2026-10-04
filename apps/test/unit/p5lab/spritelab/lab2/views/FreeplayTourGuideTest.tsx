import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {
  tourListSteps,
  tourSteps,
} from '@cdo/apps/p5lab/spritelab/lab2/views/freeplayTour';
import FreeplayTourGuide from '@cdo/apps/p5lab/spritelab/lab2/views/FreeplayTourGuide';
import {FreeplayTour} from '@cdo/apps/p5lab/spritelab/lab2/views/useFreeplayTour';

const TOUR_STEPS = tourSteps(false);
const TOUR_LIST_STEPS = tourListSteps(TOUR_STEPS);

function renderGuide(overrides: Partial<FreeplayTour> = {}) {
  const tour: FreeplayTour = {
    variant: 'steps',
    coverBlack: false,
    lines: TOUR_LIST_STEPS,
    current: TOUR_STEPS[1],
    arrowTarget: undefined,
    isLast: false,
    next: jest.fn(),
    show: jest.fn(),
    done: jest.fn(),
    ...overrides,
  };
  render(<FreeplayTourGuide tour={tour} />);
  return tour;
}

describe('FreeplayTourGuide', () => {
  describe('steps variant', () => {
    it('shows the current step and advances on Next', () => {
      const tour = renderGuide();
      expect(screen.getByText(TOUR_STEPS[1].text)).toBeTruthy();
      fireEvent.click(screen.getByRole('button', {name: 'Next'}));
      expect(tour.next).toHaveBeenCalled();
      expect(tour.done).not.toHaveBeenCalled();
    });

    it("offers Let's go on the last step", () => {
      const last = TOUR_STEPS[TOUR_STEPS.length - 1];
      const tour = renderGuide({current: last, isLast: true});
      expect(screen.queryByRole('button', {name: 'Next'})).toBeNull();
      fireEvent.click(screen.getByRole('button', {name: "Let's go"}));
      expect(tour.done).toHaveBeenCalled();
    });
  });

  describe('list variant', () => {
    it('shows every line and brings up the clicked one', () => {
      const tour = renderGuide({variant: 'list', current: undefined});
      for (const step of TOUR_LIST_STEPS) {
        expect(screen.getByRole('button', {name: step.text})).toBeTruthy();
      }
      fireEvent.click(
        screen.getByRole('button', {name: TOUR_LIST_STEPS[2].text})
      );
      expect(tour.show).toHaveBeenCalledWith(TOUR_LIST_STEPS[2].id);
    });

    it('marks the shown line pressed', () => {
      renderGuide({variant: 'list', current: TOUR_LIST_STEPS[0]});
      expect(
        screen.getByRole('button', {name: TOUR_LIST_STEPS[0].text})
      ).toHaveAttribute('aria-pressed', 'true');
      expect(
        screen.getByRole('button', {name: TOUR_LIST_STEPS[1].text})
      ).toHaveAttribute('aria-pressed', 'false');
    });

    it("finishes with a single Let's go", () => {
      const tour = renderGuide({variant: 'list', current: undefined});
      expect(screen.getAllByRole('button', {name: "Let's go"})).toHaveLength(1);
      fireEvent.click(screen.getByRole('button', {name: "Let's go"}));
      expect(tour.done).toHaveBeenCalled();
    });
  });
});
