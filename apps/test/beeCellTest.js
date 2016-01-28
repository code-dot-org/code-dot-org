var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var testUtils = require('./util/testUtils');

testUtils.setupLocales();

var BeeCell = require('@cdo/apps/maze/beeCell');
var utils = require('@cdo/apps/utils');

describe("BeeCell", function () {
  var cellEquals = function (left, right) {
    assert.equal(left.prefix_, right.prefix_);
    assert.equal(left.originalValue_, right.originalValue_);
    assert.equal(left.currentValue_, right.currentValue_);
    assert.equal(left.color_, right.color_);
    assert.equal(left.clouded_, right.clouded_);
  };

  it("can parse all valid levelbuilder strings", function () {
    var validate = function (string, expected) {
      var cell = BeeCell.parse(string);
      cellEquals(cell, expected);
    };

    validate("0", new BeeCell(0));
    validate("1", new BeeCell(1));
    validate("2", new BeeCell(2));
    validate("+1", new BeeCell(1, undefined, '+'));
    validate("+1R", new BeeCell(1, undefined, '+', 'R'));
    validate("+1P", new BeeCell(1, undefined, '+', 'P'));
    validate("-1", new BeeCell(1, undefined, '-'));
    validate("+1FC", new BeeCell(1, 'FC', '+'));
    validate("-1FC", new BeeCell(1, 'FC', '-'));
    validate("+1C", new BeeCell(1, 'C', '+'));
    validate("-1C", new BeeCell(1, 'C', '-'));
    validate("1C", new BeeCell(1, 'C'));
    validate("1Cany", new BeeCell(1, 'Cany'));
  });

  it("generates all possible grid assets", function () {
    var validate = function (string, expected) {
      var assets = BeeCell.parse(string).getPossibleGridAssets();
      assets.forEach(function (asset, i) {
        var cell = BeeCell.parse(expected[i]);
        cellEquals(asset, cell);
      });
    };

    validate("0", ["0"]);
    validate("+1", ["+1"]);
    validate("+1FC", ["+1FC"]);
    validate("+1C", ["+1FC", "0FC"]);
    validate("-1C", ["-1FC", "0FC"]);
    validate("1C", ["+1FC", "-1FC"]);
    validate("1Cany", ["+1FC", "-1FC", "0FC"]);
  });
});
