var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var CrosshairOverlay = require('@cdo/apps/applab/CrosshairOverlay');

describe("CrosshairOverlay", function () {

    it("ellipsifies id strings that exceed max length", function () {
      assert.equal("abcdefghi", CrosshairOverlay.ellipsify("abcdefghi", 12));
      assert.equal("abcdefghijkl", CrosshairOverlay.ellipsify("abcdefghijkl", 12));
      assert.equal("abcdefghi...", CrosshairOverlay.ellipsify("abcdefghijklm", 12));
    });
});
