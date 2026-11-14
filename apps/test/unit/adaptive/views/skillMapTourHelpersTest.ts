import type {Tour} from 'shepherd.js';

import {
  buildSkillMapTourSteps,
  getSkillMapTourStepIndices,
  SKILL_MAP_TOUR_INITIAL_STEP,
  SKILL_MAP_TOUR_STORAGE_KEY,
} from '@cdo/apps/adaptive/views/skillMapTourHelpers';

// Minimal Tour stand-in: only next() is called by gotItButton closures.
const mockTour = {next: jest.fn()} as unknown as Tour;

describe('buildSkillMapTourSteps', () => {
  it('returns 4 steps without skipped checkpoints', () => {
    expect(buildSkillMapTourSteps(mockTour, false)).toHaveLength(4);
  });

  it('returns 5 steps with skipped checkpoints', () => {
    expect(buildSkillMapTourSteps(mockTour, true)).toHaveLength(5);
  });

  it('targets the map canvas on step 1', () => {
    expect(buildSkillMapTourSteps(mockTour, false)[0].attachTo).toMatchObject({
      element: '#adaptive-tour-map-canvas',
    });
  });

  it('targets the first checkpoint on step 2', () => {
    expect(buildSkillMapTourSteps(mockTour, false)[1].attachTo).toMatchObject({
      element: '#adaptive-tour-first-checkpoint',
    });
  });

  it('targets the map area on step 3', () => {
    expect(buildSkillMapTourSteps(mockTour, false)[2].attachTo).toMatchObject({
      element: '#adaptive-tour-map',
    });
  });

  it('targets the side panel on step 4', () => {
    expect(buildSkillMapTourSteps(mockTour, false)[3].attachTo).toMatchObject({
      element: '#adaptive-tour-side',
    });
  });

  describe('with skipped checkpoints', () => {
    it('inserts the Skill Check step at index 2', () => {
      expect(buildSkillMapTourSteps(mockTour, true)[2].attachTo).toMatchObject({
        element: '#adaptive-tour-first-available',
      });
    });

    it('moves the open-checkpoints step to index 3', () => {
      expect(buildSkillMapTourSteps(mockTour, true)[3].attachTo).toMatchObject({
        element: '#adaptive-tour-map',
      });
    });

    it('keeps the sidebar step last', () => {
      const steps = buildSkillMapTourSteps(mockTour, true);
      expect(steps[steps.length - 1].attachTo).toMatchObject({
        element: '#adaptive-tour-side',
      });
    });
  });

  it('gives every step a non-empty string text field', () => {
    buildSkillMapTourSteps(mockTour, true).forEach(step => {
      expect(typeof step.text).toBe('string');
      expect((step.text as string).length).toBeGreaterThan(0);
    });
  });

  it('gives every step a non-empty title string', () => {
    buildSkillMapTourSteps(mockTour, true).forEach(step => {
      expect(typeof step.title).toBe('string');
      expect((step.title as string).length).toBeGreaterThan(0);
    });
  });

  it('has Got-it buttons on info steps, no button on the pick step, and Done on the sidebar step', () => {
    const steps = buildSkillMapTourSteps(mockTour, false);
    expect(steps[0].buttons).toHaveLength(1); // Got it
    expect(steps[1].buttons).toHaveLength(1); // Got it
    expect(steps[2].buttons).toHaveLength(0); // checkpoint click advances
    expect(steps[3].buttons).toHaveLength(1); // Done
  });
});

describe('getSkillMapTourStepIndices', () => {
  it('returns pickCheckpoint=2 and sidebar=3 without skipped checkpoints', () => {
    const indices = getSkillMapTourStepIndices(false);
    expect(indices.pickCheckpoint).toBe(2);
    expect(indices.sidebar).toBe(3);
  });

  it('returns pickCheckpoint=3 and sidebar=4 with skipped checkpoints', () => {
    const indices = getSkillMapTourStepIndices(true);
    expect(indices.pickCheckpoint).toBe(3);
    expect(indices.sidebar).toBe(4);
  });
});

describe('SKILL_MAP_TOUR_STORAGE_KEY', () => {
  it('is a non-empty string', () => {
    expect(typeof SKILL_MAP_TOUR_STORAGE_KEY).toBe('string');
    expect(SKILL_MAP_TOUR_STORAGE_KEY.length).toBeGreaterThan(0);
  });
});

describe('SKILL_MAP_TOUR_INITIAL_STEP', () => {
  it('starts on step 0', () => {
    expect(SKILL_MAP_TOUR_INITIAL_STEP).toBe(0);
  });
});
