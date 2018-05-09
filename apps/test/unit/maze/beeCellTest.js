import { expect } from '../../util/configuredChai';
import BeeCell from '@cdo/apps/maze/beeCell';

describe("BeeCell", function () {
  var cellEquals = function (left, right) {
    expect(left.tileType_).to.equal(right.tileType_);
    expect(left.featureType_).to.equal(right.featureType_);
    expect(left.originalValue_).to.equal(right.originalValue_);
    expect(left.cloudType_).to.equal(right.cloudType_);
    expect(left.flowerColor_).to.equal(right.flowerColor_);
    expect(left.range_).to.equal(right.range_);
  };

  it("can parse all formerly-valid map values", function () {
    var validate = function (map, dirt, expected) {
      var cell = BeeCell.parseFromOldValues(map, dirt);
      cellEquals(cell, expected);
    };

    validate(0, 0, new BeeCell(0));
    validate(1, 0, new BeeCell(1));
    validate(2, 0, new BeeCell(2));
    validate(1, 1, new BeeCell(1, BeeCell.FeatureType.FLOWER, 1));
    validate("P", 1, new BeeCell(1, BeeCell.FeatureType.FLOWER, 1, undefined, BeeCell.FlowerColor.PURPLE));
    validate("R", 1, new BeeCell(1, BeeCell.FeatureType.FLOWER, 1, undefined, BeeCell.FlowerColor.RED));
    validate(1, -1, new BeeCell(1, BeeCell.FeatureType.HIVE, 1));
    validate("FC", 1, new BeeCell(1, BeeCell.FeatureType.FLOWER, 1, BeeCell.CloudType.STATIC));
    validate("FC", -1, new BeeCell(1, BeeCell.FeatureType.HIVE, 1, BeeCell.CloudType.STATIC));
  });

  it("generates all possible grid assets", function () {
    var validate = function (original, expected) {
      var assets = original.getPossibleGridAssets();
      expect(assets.length).to.equal(expected.length);
      assets.forEach(function (asset, i) {
        cellEquals(asset, expected[i]);
      });
    };

    validate(new BeeCell(0), [new BeeCell(0)]);
    validate(new BeeCell(1), [new BeeCell(1)]);
    validate(new BeeCell(1, 1, 1), [new BeeCell(1, 1, 1)]);
    validate(new BeeCell(1, 1, 1, 0), [new BeeCell(1, 1, 1, 0)]);
    validate(new BeeCell(1, 2, 1, 1), [new BeeCell(1, 1, 1, 0), new BeeCell(1, 0, 1, 0)]);
    validate(new BeeCell(1, 2, 1, 2), [new BeeCell(1, 1, 1, 0), new BeeCell(1, undefined, undefined, 0)]);
    validate(new BeeCell(1, 2, 1, 3), [new BeeCell(1, 0, 1, 0), new BeeCell(1, undefined, undefined, 0)]);
    validate(new BeeCell(1, 2, 1, 4), [new BeeCell(1, 1, 1, 0), new BeeCell(1, 0, 1, 0), new BeeCell(1, undefined, undefined, 0)]);
  });
});
