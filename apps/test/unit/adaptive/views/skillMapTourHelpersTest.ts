import {
  buildSkillMapTourSteps,
  getSkillMapTourStepIndices,
  SKILL_MAP_TOUR_INITIAL_STEP,
  SKILL_MAP_TOUR_STORAGE_KEY,
} from '@cdo/apps/adaptive/views/skillMapTourHelpers';

describe('buildSkillMapTourSteps', () => {
  it('returns 3 steps without skipped checkpoints', () => {
    expect(buildSkillMapTourSteps(false)).toHaveLength(3);
  });

  it('returns 4 steps with skipped checkpoints', () => {
    expect(buildSkillMapTourSteps(true)).toHaveLength(4);
  });

  it('targets the map canvas on step 1', () => {
    expect(buildSkillMapTourSteps(false)[0].element).toBe(
      '#adaptive-tour-map-canvas'
    );
  });

  it('targets the map canvas on step 2 so all nodes are clickable', () => {
    expect(buildSkillMapTourSteps(false)[1].element).toBe(
      '#adaptive-tour-map-canvas'
    );
  });

  it('targets the side panel on step 3', () => {
    expect(buildSkillMapTourSteps(false)[2].element).toBe(
      '#adaptive-tour-side'
    );
  });

  it('positions step 1 to the right of the map canvas', () => {
    expect(buildSkillMapTourSteps(false)[0].position).toBe('right');
  });

  describe('with skipped checkpoints', () => {
    it('inserts the Skill Checks step at index 1', () => {
      expect(buildSkillMapTourSteps(true)[1].element).toBe(
        '#adaptive-tour-first-available'
      );
    });

    it('moves the open-checkpoints step to index 2', () => {
      expect(buildSkillMapTourSteps(true)[2].element).toBe(
        '#adaptive-tour-map-canvas'
      );
    });

    it('keeps the sidebar step last', () => {
      const steps = buildSkillMapTourSteps(true);
      expect(steps[steps.length - 1].element).toBe('#adaptive-tour-side');
    });
  });

  it('wraps every intro in a React element so intro.js does not render raw HTML', () => {
    buildSkillMapTourSteps(true).forEach((step, i) => {
      expect(typeof step.intro).toBe('object');
    });
  });

  it('gives every step a non-empty title string', () => {
    buildSkillMapTourSteps(true).forEach((step, i) => {
      expect(typeof step.title).toBe('string');
      expect((step.title as string).length).toBeGreaterThan(0);
    });
  });
});

describe('getSkillMapTourStepIndices', () => {
  it('returns pickCheckpoint=1 and sidebar=2 without skipped checkpoints', () => {
    const indices = getSkillMapTourStepIndices(false);
    expect(indices.pickCheckpoint).toBe(1);
    expect(indices.sidebar).toBe(2);
  });

  it('returns pickCheckpoint=2 and sidebar=3 with skipped checkpoints', () => {
    const indices = getSkillMapTourStepIndices(true);
    expect(indices.pickCheckpoint).toBe(2);
    expect(indices.sidebar).toBe(3);
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
