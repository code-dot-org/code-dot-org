import {expect} from '../../../util/reconfiguredChai';
import {levelProgressStyle} from '@cdo/apps/templates/progress/progressStyles';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import color from '@cdo/apps/util/color';

describe('progressStyles', () => {
  describe('levelProgressStyle', () => {
    it('when level is assessment and levelStatus is not tried has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.not_tried,
        LevelKind.assessment
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_not_tried);
      expect(progressStyle.borderColor).to.equal(color.lighter_gray);
    });

    it('when level is assessment and levelStatus is attempted has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.attempted,
        LevelKind.assessment
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_not_tried);
      expect(progressStyle.borderColor).to.equal(color.level_submitted);
    });

    it('when level is assessment and levelStatus is submitted has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.submitted,
        LevelKind.assessment
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_submitted);
      expect(progressStyle.borderColor).to.equal(color.level_submitted);
    });

    it('when level is assessment and levelStatus is completed has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.completed_assessment,
        LevelKind.assessment
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_submitted);
      expect(progressStyle.borderColor).to.equal(color.level_submitted);
    });

    it('when level is assessment and levelStatus is perfect has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.perfect,
        LevelKind.assessment
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_submitted);
      expect(progressStyle.borderColor).to.equal(color.level_submitted);
    });

    it('when level is not assessment and levelStatus is not tried has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.not_tried,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_not_tried);
      expect(progressStyle.borderColor).to.equal(color.lighter_gray);
    });

    it('when level is not assessment and levelStatus is attempted has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.attempted,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_not_tried);
      expect(progressStyle.borderColor).to.equal(color.level_perfect);
    });

    it('when level is not assessment and levelStatus is perfect has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.perfect,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_perfect);
      expect(progressStyle.borderColor).to.equal(color.level_perfect);
    });

    it('when level is not assessment and levelStatus is free_play_complete has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.free_play_complete,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_perfect);
      expect(progressStyle.borderColor).to.equal(color.level_perfect);
    });

    it('when level is not assessment and levelStatus is passed has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.passed,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_passed);
      expect(progressStyle.borderColor).to.equal(color.level_perfect);
    });

    it('when level is not assessment and levelStatus is submitted has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.submitted,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_submitted);
      expect(progressStyle.borderColor).to.equal(color.level_submitted);
    });

    it('when level is not assessment and levelStatus is completed assessment (submittable) has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.completed_assessment,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_submitted);
      expect(progressStyle.borderColor).to.equal(color.level_submitted);
    });

    it('when level is not assessment and levelStatus is reviewed rejected has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.review_rejected,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).to.equal(
        color.level_review_rejected
      );
      expect(progressStyle.borderColor).to.equal(color.level_review_rejected);
    });

    it('when level is not assessment and levelStatus is reviewed completed has expected background and border color', () => {
      const progressStyle = levelProgressStyle(
        LevelStatus.review_accepted,
        LevelKind.level
      );

      expect(progressStyle.backgroundColor).to.equal(color.level_perfect);
      expect(progressStyle.borderColor).to.equal(color.level_perfect);
    });
  });
});
