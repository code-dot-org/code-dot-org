import {isSubsequence} from '@cdo/apps/utils';
import {normalize} from '@cdo/apps/utils';
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

  describe('the normalize funtion', () => {
    it('leaves unit vectors unchanged', () => {
      expect(normalize({x: 1, y: 0})).to.eql({x: 1, y: 0});
      expect(normalize({x: 0, y: 1})).to.eql({x: 0, y: 1});
      expect(normalize({x: -1, y: 0})).to.eql({x: -1, y: 0});
      expect(normalize({x: 0, y: -1})).to.eql({x: 0, y: -1});
    });
    it('leaves zero vector unchanged', () => {
      expect(normalize({x: 0, y: 0})).to.eql({x: 0, y: 0});
    });
    it('normalizes non-unit vectors', () => {
      expect(normalize({x: 3, y: 0})).to.eql({x: 1, y: 0});
      expect(normalize({x: 0, y: -3})).to.eql({x: 0, y: -1});
      expect(normalize({x: 1, y: 1})).to.eql({x: 1/Math.sqrt(2), y: 1/Math.sqrt(2)});
      expect(normalize({x: 1, y: -2})).to.eql({x: 1/Math.sqrt(5), y: -2/Math.sqrt(5)});
    });
  });
});
