import {levelProgressStyle} from '@cdo/apps/templates/progress/progressStyles';
import {LevelStatus, LevelKind} from '@cdo/generated-scripts/sharedConstants';

// Semantic-token strings the live styles resolve to (see progressStyles.js).
// Tests previously asserted on exact legacy hex literals from util/color;
// we now check on the matching CSS variable strings.
const NEUTRAL_BG = 'var(--background-neutral-primary)';
const NEUTRAL_BORDER = 'var(--borders-neutral-primary)';
const SUCCESS_BG = 'var(--background-success-primary)';
const SUCCESS_BG_LIGHT = 'var(--background-success-extra-light)';
const SUCCESS_BORDER = 'var(--borders-success-primary)';
const PURPLE_BG = 'var(--background-brand-purple-primary)';
const PURPLE_BORDER = 'var(--borders-brand-purple-primary)';
const ERROR_BG = 'var(--background-error-primary)';
const ERROR_BORDER = 'var(--borders-error-primary)';

describe('progressStyles', () => {
  describe('levelProgressStyle', () => {
    it('when level is assessment and levelStatus is not tried has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.not_tried,
        LevelKind.assessment
      );

      expect(progressStyle.backgroundColor).toBe(NEUTRAL_BG);
      expect(progressStyle.borderColor).toBe(NEUTRAL_BORDER);
    });

    it('when level is assessment and levelStatus is attempted has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.attempted,
        LevelKind.assessment
      );

      expect(progressStyle.backgroundColor).toBe(NEUTRAL_BG);
      expect(progressStyle.borderColor).toBe(PURPLE_BORDER);
    });

    it('when level is assessment and levelStatus is submitted has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.submitted,
        LevelKind.assessment
      );

      expect(progressStyle.backgroundColor).toBe(PURPLE_BG);
      expect(progressStyle.borderColor).toBe(PURPLE_BORDER);
    });

    it('when level is assessment and levelStatus is completed has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.completed_assessment,
        LevelKind.assessment
      );

      expect(progressStyle.backgroundColor).toBe(PURPLE_BG);
      expect(progressStyle.borderColor).toBe(PURPLE_BORDER);
    });

    it('when level is assessment and levelStatus is perfect has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.perfect,
        LevelKind.assessment
      );

      expect(progressStyle.backgroundColor).toBe(PURPLE_BG);
      expect(progressStyle.borderColor).toBe(PURPLE_BORDER);
    });

    it('when level is not assessment and levelStatus is not tried has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.not_tried,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).toBe(NEUTRAL_BG);
      expect(progressStyle.borderColor).toBe(NEUTRAL_BORDER);
    });

    it('when level is not assessment and levelStatus is attempted has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.attempted,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).toBe(NEUTRAL_BG);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });

    it('when level is not assessment and levelStatus is perfect has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.perfect,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).toBe(SUCCESS_BG);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });

    it('when level is not assessment and levelStatus is free_play_complete has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.free_play_complete,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).toBe(SUCCESS_BG);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });

    it('when level is not assessment and levelStatus is passed has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.passed,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).toBe(SUCCESS_BG_LIGHT);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });

    it('when level is not assessment and levelStatus is submitted has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.submitted,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).toBe(PURPLE_BG);
      expect(progressStyle.borderColor).toBe(PURPLE_BORDER);
    });

    it('when level is not assessment and levelStatus is completed assessment (submittable) has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.completed_assessment,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).toBe(PURPLE_BG);
      expect(progressStyle.borderColor).toBe(PURPLE_BORDER);
    });

    it('when level is not assessment and levelStatus is reviewed rejected has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.review_rejected,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).toBe(ERROR_BG);
      expect(progressStyle.borderColor).toBe(ERROR_BORDER);
    });

    it('when level is not assessment and levelStatus is reviewed completed has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.review_accepted,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).toBe(SUCCESS_BG);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });
  });
});
