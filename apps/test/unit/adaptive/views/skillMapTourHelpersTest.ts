import {
  buildSkillMapTourSteps,
  SKILL_MAP_TOUR_INITIAL_STEP,
  SKILL_MAP_TOUR_STORAGE_KEY,
} from '@cdo/apps/adaptive/views/skillMapTourHelpers';

describe('buildSkillMapTourSteps', () => {
  it('returns 4 steps without skipped checkpoints', () => {
    expect(buildSkillMapTourSteps(false)).toHaveLength(4);
  });

  it('returns 5 steps with skipped checkpoints', () => {
    expect(buildSkillMapTourSteps(true)).toHaveLength(5);
  });

  it('targets the map canvas on step 1', () => {
    expect(buildSkillMapTourSteps(false)[0].element).toBe(
      '#adaptive-tour-map-canvas'
    );
  });

  it('targets the first available node on step 2', () => {
    expect(buildSkillMapTourSteps(false)[1].element).toBe(
      '#adaptive-tour-first-available'
    );
  });

  it('targets the side panel on step 3', () => {
    expect(buildSkillMapTourSteps(false)[2].element).toBe(
      '#adaptive-tour-side'
    );
  });

  it('targets the start button on step 4', () => {
    expect(buildSkillMapTourSteps(false)[3].element).toBe(
      '#adaptive-checkpoint-card-start'
    );
  });

  it('positions step 1 to the right of the map canvas', () => {
    expect(buildSkillMapTourSteps(false)[0].position).toBe('right');
  });

  it('positions step 4 to the left of the side panel', () => {
    expect(buildSkillMapTourSteps(false)[3].position).toBe('left');
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
