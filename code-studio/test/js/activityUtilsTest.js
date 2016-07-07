var assert = require('assert');

import { mergeActivityResult } from '../../src/js/activityUtils';

describe("mergeActivityResult", function () {
  it('returns the result with highest priority', function () {
    assert.strictEqual(mergeActivityResult(100, 200), 200);
    assert.strictEqual(mergeActivityResult(20, -50), 20);
    assert.strictEqual(mergeActivityResult(-3, -4), -3);
  });
  it('returns the other result when one result is zero', function () {
    assert.strictEqual(mergeActivityResult(0, -2), -2);
    assert.strictEqual(mergeActivityResult(-50, 0), -50);
    assert.strictEqual(mergeActivityResult(30, 0), 30);
    assert.strictEqual(mergeActivityResult(0, 0), 0);
  });
});
