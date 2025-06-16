import BeeCell from '../BeeCell';

describe('BeeCell', () => {
  const cellEquals = (left: BeeCell, right: BeeCell) => {
    expect(left.tileType_).toEqual(right.tileType_);
    expect(left.featureType_).toEqual(right.featureType_);
    expect(left.originalValue_).toEqual(right.originalValue_);
    expect(left.cloudType_).toEqual(right.cloudType_);
    expect(left.flowerColor_).toEqual(right.flowerColor_);
    expect(left.range_).toEqual(right.range_);
  };

  it('can parse all formerly-valid map values', () => {
    const validate = (
      map: string | number,
      dirt: string | number,
      expected: BeeCell,
    ) => {
      const cell = BeeCell.parseFromOldValues(map, dirt);
      cellEquals(cell, expected);
    };

    validate(0, 0, new BeeCell(0));
    validate(1, 0, new BeeCell(1));
    validate(2, 0, new BeeCell(2));
    validate(1, 1, new BeeCell(1, BeeCell.FeatureType.FLOWER, 1));
    validate(
      'P',
      1,
      new BeeCell(
        1,
        BeeCell.FeatureType.FLOWER,
        1,
        undefined,
        BeeCell.FlowerColor.PURPLE,
      ),
    );
    validate(
      'R',
      1,
      new BeeCell(
        1,
        BeeCell.FeatureType.FLOWER,
        1,
        undefined,
        BeeCell.FlowerColor.RED,
      ),
    );
    validate(1, -1, new BeeCell(1, BeeCell.FeatureType.HIVE, 1));
    validate(
      'FC',
      1,
      new BeeCell(1, BeeCell.FeatureType.FLOWER, 1, BeeCell.CloudType.STATIC),
    );
    validate(
      'FC',
      -1,
      new BeeCell(1, BeeCell.FeatureType.HIVE, 1, BeeCell.CloudType.STATIC),
    );
  });

  it('generates all possible grid assets', function () {
    const validate = (original: BeeCell, expected: BeeCell[]) => {
      const assets = original.getPossibleGridAssets();
      expect(assets.length).toEqual(expected.length);
      assets.forEach((asset: BeeCell, i: number) => {
        cellEquals(asset, expected[i]);
      });
    };

    validate(new BeeCell(0), [new BeeCell(0)]);
    validate(new BeeCell(1), [new BeeCell(1)]);
    validate(new BeeCell(1, 1, 1), [new BeeCell(1, 1, 1)]);
    validate(new BeeCell(1, 1, 1, 0), [new BeeCell(1, 1, 1, 0)]);
    validate(new BeeCell(1, 2, 1, 1), [
      new BeeCell(1, 1, 1, 0),
      new BeeCell(1, 0, 1, 0),
    ]);
    validate(new BeeCell(1, 2, 1, 2), [
      new BeeCell(1, 1, 1, 0),
      new BeeCell(1, undefined, undefined, 0),
    ]);
    validate(new BeeCell(1, 2, 1, 3), [
      new BeeCell(1, 0, 1, 0),
      new BeeCell(1, undefined, undefined, 0),
    ]);
    validate(new BeeCell(1, 2, 1, 4), [
      new BeeCell(1, 1, 1, 0),
      new BeeCell(1, 0, 1, 0),
      new BeeCell(1, undefined, undefined, 0),
    ]);
  });
});
