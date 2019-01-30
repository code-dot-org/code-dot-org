import {expect} from '../../../../../util/configuredChai';
import {isUnit6IntentionEligible, Unit6Intention} from "@cdo/apps/lib/kits/maker/util/discountLogic";

describe('discountLogic.js', () => {
  describe('isUnit6IntentionEligible', () => {
    // For winter/spring 2019, discount codes are eligible for teachers that plan to teach
    // CSD6 during the 18-19 or 19-20 school years.
    it('yes if teaching CSD6 during 18-19', () => {
      expect(isUnit6IntentionEligible(Unit6Intention.YES_18_19)).to.be.true;
    });

    it('yes if teaching CSD6 during 19-20', () => {
      expect(isUnit6IntentionEligible(Unit6Intention.YES_19_20)).to.be.true;
    });

    it('no if not teaching CSD6', () => {
      expect(isUnit6IntentionEligible(Unit6Intention.NO)).to.be.false;
    });

    it('no if teaching CSD6 later than 19-20', () => {
      expect(isUnit6IntentionEligible(Unit6Intention.YES_AFTER)).to.be.false;
    });

    it('no if unsure', () => {
      expect(isUnit6IntentionEligible(Unit6Intention.UNSURE)).to.be.false;
    });
  });
});
