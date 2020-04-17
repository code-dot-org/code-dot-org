import {expect} from '../../../../../util/deprecatedChai';
import sinon from 'sinon';
import {
  isUnit6IntentionEligible,
  Unit6Intention,
  inDiscountRedemptionWindow
} from '@cdo/apps/lib/kits/maker/util/discountLogic';

describe('discountLogic.js', () => {
  describe('isUnit6IntentionEligible', () => {
    // For winter/spring 2020, discount codes are eligible for teachers that plan to teach
    // CSD6 during the 19-20 or 20-21 school years.
    it('yes if teaching CSD6 during spring 2020', () => {
      expect(isUnit6IntentionEligible(Unit6Intention.YES_SPRING_2020)).to.be
        .true;
    });

    it('yes if teaching CSD6 during fall 2020', () => {
      expect(isUnit6IntentionEligible(Unit6Intention.YES_FALL_2020)).to.be.true;
    });

    it('yes if teaching CSD6 during spring 2021', () => {
      expect(isUnit6IntentionEligible(Unit6Intention.YES_SPRING_2021)).to.be
        .true;
    });

    it('no if not teaching CSD6', () => {
      expect(isUnit6IntentionEligible(Unit6Intention.NO)).to.be.false;
    });

    it('no if unsure', () => {
      expect(isUnit6IntentionEligible(Unit6Intention.UNSURE)).to.be.false;
    });
  });

  describe('inDiscountRedemptionWindow', () => {
    let clock;

    afterEach(function() {
      if (clock) {
        clock.restore();
        clock = undefined;
      }
    });

    it('yes if teaching CSD6 during spring 2020', () => {
      expect(inDiscountRedemptionWindow(Unit6Intention.YES_SPRING_2020)).to.be
        .true;
    });

    it('yes if teaching CSD6 during fall 2020 and inside redemption window', () => {
      clock = sinon.useFakeTimers(new Date('2020-09-01'));
      expect(inDiscountRedemptionWindow(Unit6Intention.YES_FALL_2020)).to.be
        .true;
    });

    it('no if teaching CSD6 during fall 2020 and outside redemption window', () => {
      clock = sinon.useFakeTimers(new Date('2020-05-01'));
      expect(inDiscountRedemptionWindow(Unit6Intention.YES_FALL_2020)).to.be
        .false;
    });

    it('yes if teaching CSD6 during spring 2021 and inside redemption window', () => {
      clock = sinon.useFakeTimers(new Date('2020-12-01'));
      expect(inDiscountRedemptionWindow(Unit6Intention.YES_SPRING_2021)).to.be
        .true;
    });

    it('no if teaching CSD6 during spring 2021 and outside redemption window', () => {
      clock = sinon.useFakeTimers(new Date('2020-05-01'));
      expect(inDiscountRedemptionWindow(Unit6Intention.YES_SPRING_2021)).to.be
        .false;
    });

    it('no if not teaching CSD6 ', () => {
      expect(inDiscountRedemptionWindow(Unit6Intention.NO)).to.be.false;
    });
  });
});
