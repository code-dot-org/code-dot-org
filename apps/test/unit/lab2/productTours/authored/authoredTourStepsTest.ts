import Shepherd, {type StepOptions} from 'shepherd.js';

import {
  createAuthoredTourSteps,
  effectiveRequirement,
} from '@cdo/apps/lab2/productTours/authored/authoredTourSteps';
import {AuthoredTour} from '@cdo/apps/lab2/productTours/authored/types';

const tour: AuthoredTour = {
  id: 'tour-1',
  name: 'Intro',
  steps: [
    {id: 'welcome', title: 'Welcome', text: 'Line one\nLine <b>two</b>'},
    {
      id: 'train',
      anchor: 'train-button',
      title: 'Train',
      text: 'Click Train model.',
      placement: 'left',
      requirement: {type: 'click'},
    },
    {id: 'done', anchor: 'train-button', title: 'Done', text: 'All set.'},
  ],
};

const buttonTexts = (step: StepOptions) =>
  (step.buttons as {text: string}[]).map(button => button.text);

describe('createAuthoredTourSteps', () => {
  const steps = createAuthoredTourSteps(tour, 'ailab')(new Shepherd.Tour());

  it('centers a step with no anchor and attaches a step that has one', () => {
    expect(steps[0].attachTo).toBeUndefined();
    const selector = '[data-tour-anchor="train-button"]';
    expect(steps[1].attachTo).toEqual({element: selector, on: 'left'});
    expect(steps[2].attachTo).toEqual({element: selector, on: 'auto'});
  });

  it('gives each step the buttons its position and requirement call for', () => {
    expect(buttonTexts(steps[0])).toEqual(['Next']);
    expect(buttonTexts(steps[1])).toEqual(['Back']);
    expect(buttonTexts(steps[2])).toEqual(['Back', 'Done']);
  });

  it('escapes authored copy and keeps its line breaks', () => {
    expect(steps[0].text).toBe('Line one<br>Line &lt;b&gt;two&lt;/b&gt;');
  });
});

describe('a click step whose target never appears', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('gains a Next button so the student can go on', async () => {
    const shepherdTour = new Shepherd.Tour();
    shepherdTour.addSteps(createAuthoredTourSteps(tour, 'ailab')(shepherdTour));
    const clickStep = shepherdTour.getById('train');
    const waiting = clickStep?.options.beforeShowPromise?.();
    jest.runAllTimers();
    await waiting;
    expect(
      (clickStep?.options.buttons as {text: string}[]).map(b => b.text)
    ).toEqual(['Back', 'Next']);
  });
});

describe('effectiveRequirement', () => {
  it('defaults to the Next button', () => {
    expect(effectiveRequirement({id: 'a', title: '', text: ''})).toEqual({
      type: 'next',
    });
  });

  it('falls back to the Next button for a click with nothing to click', () => {
    expect(
      effectiveRequirement({
        id: 'a',
        title: '',
        text: '',
        requirement: {type: 'click'},
      })
    ).toEqual({type: 'next'});
  });
});
