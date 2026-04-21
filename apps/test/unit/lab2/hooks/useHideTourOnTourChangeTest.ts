import {renderHook} from '@testing-library/react-hooks';
import {Tour} from 'shepherd.js';

import useHideTourOnTourChange from '@cdo/apps/lab2/hooks/useHideTourOnTourChange';

const makeTour = () => ({hide: jest.fn()} as unknown as Tour);

describe('useHideTourOnTourChange', () => {
  it('does not call hide on initial render', () => {
    const tour = makeTour();
    renderHook(() => useHideTourOnTourChange(tour));
    expect(tour.hide).not.toHaveBeenCalled();
  });

  it('no errors when tour remains null', () => {
    const {rerender} = renderHook(() => useHideTourOnTourChange(null));
    rerender();
  });

  it('hides the previous tour when the tour instance changes', () => {
    const tourA = makeTour();
    const tourB = makeTour();
    let currentTour: Tour | null = tourA;
    const {rerender} = renderHook(() => useHideTourOnTourChange(currentTour));

    currentTour = tourB;
    rerender();

    expect(tourA.hide).toHaveBeenCalledTimes(1);
    expect(tourB.hide).not.toHaveBeenCalled();
  });

  it('does not hide when the same tour instance is passed again', () => {
    const tour = makeTour();
    const {rerender} = renderHook(() => useHideTourOnTourChange(tour));
    rerender();
    expect(tour.hide).not.toHaveBeenCalled();
  });

  it('hides the previous tour when tour changes from a value to null', () => {
    const tourA = makeTour();
    let currentTour: Tour | null = tourA;
    const {rerender} = renderHook(() => useHideTourOnTourChange(currentTour));

    currentTour = null;
    rerender();

    expect(tourA.hide).toHaveBeenCalledTimes(1);
  });

  it('hides the current tour on unmount', () => {
    const tour = makeTour();
    const {unmount} = renderHook(() => useHideTourOnTourChange(tour));
    unmount();
    expect(tour.hide).toHaveBeenCalledTimes(1);
  });

  it('no errors on unmount when tour is null', () => {
    const {unmount} = renderHook(() => useHideTourOnTourChange(null));
    unmount();
  });
});
