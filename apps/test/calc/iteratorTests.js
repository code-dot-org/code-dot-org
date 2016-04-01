var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('../util/testUtils');

var InputIterator = require('@cdo/apps/calc/inputIterator');

describe('InputIterator', function () {
  it('works for a single param', function () {
    var values = [1, 5, 10];
    var numParams = 1;
    var iterator = new InputIterator(values, numParams);

    assert.equal(iterator.remaining(), 3);
    assert.deepEqual(iterator.next(), [1]);
    assert.equal(iterator.remaining(), 2);
    assert.deepEqual(iterator.next(), [5]);
    assert.equal(iterator.remaining(), 1);
    assert.deepEqual(iterator.next(), [10]);
    assert.equal(iterator.remaining(), 0);
    assert.throws(function () {
      iterator.next();
    });
  });

  it('works for two params', function () {
    var values = [1, 3, 5];
    var numParams = 2;
    var iterator = new InputIterator(values, numParams);

    assert.equal(iterator.remaining(), 9);
    assert.deepEqual(iterator.next(), [1, 1]);
    assert.deepEqual(iterator.next(), [3, 1]);
    assert.deepEqual(iterator.next(), [5, 1]);
    assert.deepEqual(iterator.next(), [1, 3]);
    assert.deepEqual(iterator.next(), [3, 3]);
    assert.deepEqual(iterator.next(), [5, 3]);
    assert.deepEqual(iterator.next(), [1, 5]);
    assert.deepEqual(iterator.next(), [3, 5]);
    assert.deepEqual(iterator.next(), [5, 5]);
    assert.equal(iterator.remaining(), 0);
    assert.throws(function () {
      iterator.next();
    });
  });

  it('works for three params', function () {
    var values = [0, 1];
    var numParams = 3;
    var iterator = new InputIterator(values, numParams);

    assert.equal(iterator.remaining(), 8);
    assert.deepEqual(iterator.next(), [0, 0, 0]);
    assert.deepEqual(iterator.next(), [1, 0, 0]);
    assert.deepEqual(iterator.next(), [0, 1, 0]);
    assert.deepEqual(iterator.next(), [1, 1, 0]);
    assert.deepEqual(iterator.next(), [0, 0, 1]);
    assert.deepEqual(iterator.next(), [1, 0, 1]);
    assert.deepEqual(iterator.next(), [0, 1, 1]);
    assert.deepEqual(iterator.next(), [1, 1, 1]);
    assert.equal(iterator.remaining(), 0);
    assert.throws(function () {
      iterator.next();
    });
  });
});
