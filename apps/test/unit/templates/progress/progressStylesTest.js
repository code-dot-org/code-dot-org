import {expect} from '../../../util/reconfiguredChai';
import {
  mainBubbleStyle,
  levelProgressStyle,
  BubbleSize,
  BubbleShape,
  bubbleStyles
} from '@cdo/apps/templates/progress/progressStyles';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import color from '@cdo/apps/util/color';

describe('progressStyles', () => {
  describe('mainBubbleStyle', () => {
    it('when shape is a pill style includes bubbleStyles.pill', () => {
      const bubbleStyle = mainBubbleStyle(
        BubbleShape.pill,
        BubbleSize.full,
        {}
      );

      expect(bubbleStyle).to.include(bubbleStyles.pill);
    });

    it('when shape is a diamond style includes bubbleStyles.diamond', () => {
      const bubbleStyle = mainBubbleStyle(
        BubbleShape.diamond,
        BubbleSize.full,
        {}
      );

      expect(bubbleStyle).to.include(bubbleStyles.diamond);
    });

    it('when shape is a diamond and size is dot has expected border radius, min/max widths and font size', () => {
      const bubbleStyle = mainBubbleStyle(
        BubbleShape.diamond,
        BubbleSize.dot,
        {}
      );

      expect(bubbleStyle.borderRadius).to.equal(2);
      expect(bubbleStyle.minWidth).to.equal(10);
      expect(bubbleStyle.maxWidth).to.equal(10);
    });

    it('when shape is a diamond and size is full has expected border radius, min/max widths and font size', () => {
      const bubbleStyle = mainBubbleStyle(
        BubbleShape.diamond,
        BubbleSize.full,
        {}
      );

      expect(bubbleStyle.borderRadius).to.equal(4);
      expect(bubbleStyle.fontSize).to.equal(16);
      expect(bubbleStyle.minWidth).to.equal(26);
      expect(bubbleStyle.maxWidth).to.equal(26);
    });

    it('when shape is a circle and size is dot has expected border radius, min/max widths and font size', () => {
      const bubbleStyle = mainBubbleStyle(
        BubbleShape.circle,
        BubbleSize.dot,
        {}
      );

      expect(bubbleStyle.borderRadius).to.equal(13);
      expect(bubbleStyle.minWidth).to.equal(13);
      expect(bubbleStyle.maxWidth).to.equal(13);
    });

    it('when shape is a circle and size is letter has expected border radius, min/max widths and font size', () => {
      const bubbleStyle = mainBubbleStyle(
        BubbleShape.circle,
        BubbleSize.letter,
        {}
      );

      expect(bubbleStyle.borderRadius).to.equal(20);
      expect(bubbleStyle.fontSize).to.equal(12);
      expect(bubbleStyle.minWidth).to.equal(20);
      expect(bubbleStyle.maxWidth).to.equal(20);
    });

    it('when shape is a circle and size is full has expected border radius, min/max widths and font size', () => {
      const bubbleStyle = mainBubbleStyle(
        BubbleShape.circle,
        BubbleSize.full,
        {}
      );

      expect(bubbleStyle.borderRadius).to.equal(34);
      expect(bubbleStyle.fontSize).to.equal(16);
      expect(bubbleStyle.minWidth).to.equal(34);
      expect(bubbleStyle.maxWidth).to.equal(34);
    });

    it('includes bubbleStyles.main and progressStyle', () => {
      const progressStyle = {color: 'blue', backgroundColor: 'purple'};

      const bubbleStyle = mainBubbleStyle(
        BubbleShape.circle,
        BubbleSize.full,
        progressStyle
      );

      expect(bubbleStyle).to.include(bubbleStyles.main);
      expect(bubbleStyle).to.include(progressStyle);
    });
  });

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
