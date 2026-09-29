import {
  levelHoverClass,
  levelProgressStyle,
} from '@cdo/apps/templates/progress/progressStyles';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

// Semantic-token strings the live styles resolve to (see progressStyles.js).
// Tests previously asserted on exact legacy hex literals from util/color;
// we now check on the matching CSS variable strings.
const NEUTRAL_BG = 'var(--background-neutral-primary)';
const NEUTRAL_BORDER = 'var(--borders-neutral-primary)';
const SUCCESS_BG = 'var(--background-success-primary)';
const SUCCESS_BG_MID = 'var(--background-success-mid)';
const SUCCESS_BORDER = 'var(--background-success-primary)';
const ERROR_BG = 'var(--background-error-primary)';
const ERROR_BORDER = 'var(--borders-error-primary)';

describe('progressStyles', () => {
  describe('levelProgressStyle', () => {
    // Assessment levels no longer get their own (purple) styling; they are
    // denoted by a star badge instead. All levels style by status alone.
    it('when levelStatus is not tried has expected background and border color', () => {
      const progressStyle = levelProgressStyle(LevelStatus.not_tried);

      expect(progressStyle.backgroundColor).toBe(NEUTRAL_BG);
      expect(progressStyle.borderColor).toBe(NEUTRAL_BORDER);
    });

    it('when levelStatus is attempted has expected background and border color', () => {
      const progressStyle = levelProgressStyle(LevelStatus.attempted);

      expect(progressStyle.backgroundColor).toBe(NEUTRAL_BG);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });

    it('when levelStatus is submitted has expected background and border color', () => {
      const progressStyle = levelProgressStyle(LevelStatus.submitted);

      expect(progressStyle.backgroundColor).toBe(SUCCESS_BG);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });

    it('when levelStatus is completed assessment has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.completed_assessment
      );

      expect(progressStyle.backgroundColor).toBe(SUCCESS_BG);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });

    it('when levelStatus is perfect has expected background and border color', () => {
      const progressStyle = levelProgressStyle(LevelStatus.perfect);

      expect(progressStyle.backgroundColor).toBe(SUCCESS_BG);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });

    it('when levelStatus is free_play_complete has expected background and border color', () => {
      const progressStyle = levelProgressStyle(LevelStatus.free_play_complete);

      expect(progressStyle.backgroundColor).toBe(SUCCESS_BG);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });

    it('when levelStatus is passed has expected background and border color', () => {
      const progressStyle = levelProgressStyle(LevelStatus.passed);

      expect(progressStyle.backgroundColor).toBe(SUCCESS_BG_MID);
      expect(progressStyle.borderColor).toBe(SUCCESS_BG_MID);
    });

    it('when levelStatus is reviewed rejected has expected background and border color', () => {
      const progressStyle = levelProgressStyle(LevelStatus.review_rejected);

      expect(progressStyle.backgroundColor).toBe(ERROR_BG);
      expect(progressStyle.borderColor).toBe(ERROR_BORDER);
    });

    it('when levelStatus is reviewed completed has expected background and border color', () => {
      const progressStyle = levelProgressStyle(LevelStatus.review_accepted);

      expect(progressStyle.backgroundColor).toBe(SUCCESS_BG);
      expect(progressStyle.borderColor).toBe(SUCCESS_BORDER);
    });
  });

  describe('levelHoverClass', () => {
    it('treats every finished status as completed', () => {
      [
        LevelStatus.perfect,
        LevelStatus.passed,
        LevelStatus.submitted,
        LevelStatus.free_play_complete,
        LevelStatus.completed_assessment,
        LevelStatus.review_accepted,
      ].forEach(status =>
        expect(levelHoverClass(status)).toBe('hover-completed')
      );
    });

    it('treats an attempted level as in progress', () => {
      expect(levelHoverClass(LevelStatus.attempted)).toBe('hover-in-progress');
    });

    it('gives a rejected review its own class', () => {
      expect(levelHoverClass(LevelStatus.review_rejected)).toBe(
        'hover-rejected'
      );
    });

    it('falls back to not started for unstarted and unknown statuses', () => {
      [
        LevelStatus.not_tried,
        LevelStatus.dots_disabled,
        undefined,
        'a status that does not exist',
      ].forEach(status =>
        expect(levelHoverClass(status)).toBe('hover-not-started')
      );
    });
  });
});
