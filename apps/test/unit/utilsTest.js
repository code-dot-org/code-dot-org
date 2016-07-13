import {isSubsequence} from '@cdo/apps/utils';
import {expect} from '../util/configuredChai';

describe('utils modules', () => {
  describe('the isSubsequence function', () => {
    it("returns false when the subsequence is not a subsequence", () => {
      expect(isSubsequence([1,2,3], [5])).to.be.false;
      expect(isSubsequence([1,2,3], [1,2,3,5])).to.be.false;
      expect(isSubsequence([1,2,3], [1,2,2])).to.be.false;
      expect(isSubsequence([1,2,3], [3, 2])).to.be.false;
    });

    it("returns true when the subsequence is a subsequence", () => {
      expect(isSubsequence([1,2,3], [])).to.be.true;
      expect(isSubsequence([1,2,3], [1])).to.be.true;
      expect(isSubsequence([1,2,3], [2])).to.be.true;
      expect(isSubsequence([1,2,3], [3])).to.be.true;
      expect(isSubsequence([1,2,3], [1,2])).to.be.true;
      expect(isSubsequence([1,2,3], [2,3])).to.be.true;
      expect(isSubsequence([1,2,3], [1,3])).to.be.true;
      expect(isSubsequence([1,2,3], [1,2,3])).to.be.true;
    });
  });
});
