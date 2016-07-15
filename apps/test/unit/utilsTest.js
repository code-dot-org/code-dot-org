import {isSubsequence, shallowCopy, cloneWithoutFunctions} from '@cdo/apps/utils';
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

  describe('shallowCopy', function () {
    it("makes a shallow copy of an object", function () {
      const originalObject = {
        num: 2,
        obj: {}
      };
      const newObject = shallowCopy(originalObject);
      expect(newObject).not.to.equal(originalObject);
      expect(newObject).to.deep.equal(originalObject);
      expect(newObject.obj).to.equal(originalObject.obj);
    });
  });

  describe('cloneWithoutFunctions', function () {
    it('strips functions from an object', function () {
      const originalObject = {
        num: 2,
        func: function () {}
      };
      const newObject = cloneWithoutFunctions(originalObject);
      expect(newObject).not.to.equal(originalObject);
      expect(newObject.num).to.equal(originalObject.num);
      expect(newObject.func).to.be.undefined;
    });
  });
});
