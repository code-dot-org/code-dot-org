import {
  addReferences,
  copyTour,
  moveStep,
  removeReference,
  removeStep,
  replaceStep,
  setAutoStart,
  swapReference,
} from '@cdo/apps/lab2/productTours/authored/editor/tourEditorState';
import {AuthoredTour} from '@cdo/apps/lab2/productTours/authored/types';

const tour: AuthoredTour = {
  id: 'tour-1',
  name: 'Intro',
  steps: ['a', 'b', 'c'].map(id => ({id, title: id, text: ''})),
};

const stepIds = (updated: AuthoredTour) => updated.steps.map(step => step.id);

describe('tourEditorState', () => {
  it('moves a step earlier or later', () => {
    expect(stepIds(moveStep(tour, 'b', -1))).toEqual(['b', 'a', 'c']);
    expect(stepIds(moveStep(tour, 'b', 1))).toEqual(['a', 'c', 'b']);
  });

  it('leaves the first and last step in place at the ends', () => {
    expect(moveStep(tour, 'a', -1)).toBe(tour);
    expect(moveStep(tour, 'c', 1)).toBe(tour);
  });

  it('replaces and removes a step by id', () => {
    const replaced = replaceStep(tour, {id: 'b', title: 'new', text: ''});
    expect(replaced.steps[1].title).toBe('new');
    expect(stepIds(removeStep(tour, 'b'))).toEqual(['a', 'c']);
  });

  it('adds each library tour to a level once, not starting on its own', () => {
    const references = addReferences([{id: 'x', autoStart: true}], ['x', 'y']);
    expect(references).toEqual([
      {id: 'x', autoStart: true},
      {id: 'y', autoStart: false},
    ]);
    expect(setAutoStart(references, 'y', true)[1].autoStart).toBe(true);
    expect(removeReference(references, 'x')).toEqual([
      {id: 'y', autoStart: false},
    ]);
  });

  it('copies a tour under a new id and name, keeping its steps', () => {
    const copy = copyTour(tour);
    expect(copy.id).not.toBe(tour.id);
    expect(copy.name).toBe(`${tour.name} (copy)`);
    expect(copy.steps).toEqual(tour.steps);
  });

  it('swaps one reference for another, keeping its place and auto-start', () => {
    const references = [
      {id: 'x', autoStart: true},
      {id: 'y', autoStart: false},
    ];
    expect(swapReference(references, 'x', 'z')).toEqual([
      {id: 'z', autoStart: true},
      {id: 'y', autoStart: false},
    ]);
  });
});
