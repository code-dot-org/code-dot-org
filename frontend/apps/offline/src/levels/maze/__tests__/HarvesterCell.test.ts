import HarvesterCell from '../HarvesterCell';
import {SquareType} from '../tiles';

describe('HarvesterCell', () => {
  it('has reasonable defaults', () => {
    const cell = new HarvesterCell(0);

    expect(cell.startsHidden()).toEqual(false);
    expect(cell.isVariable()).toEqual(false);
    expect(cell.featureName()).toEqual('none');
    expect(cell.featureType()).toEqual(HarvesterCell.FeatureType.NONE);
    expect(cell.possibleFeatures_).toEqual([HarvesterCell.FeatureType.NONE]);
  });

  it('can vary on type', () => {
    const variableFeatureCell = HarvesterCell.deserialize({
      tileType: SquareType.OPEN,
      value: 1,
      possibleFeatures: [
        HarvesterCell.FeatureType.CORN,
        HarvesterCell.FeatureType.PUMPKIN,
      ],
    });

    const variableFeatures = variableFeatureCell.getPossibleGridAssets();

    expect(variableFeatures.length).toEqual(2);
    expect(variableFeatures[0].serialize()).toEqual({
      tileType: SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [HarvesterCell.FeatureType.CORN],
      startsHidden: true,
    });
    expect(variableFeatures[1].serialize()).toEqual({
      tileType: SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [HarvesterCell.FeatureType.PUMPKIN],
      startsHidden: true,
    });
  });

  it('can vary on quantitiy', () => {
    const variableRangeCell = HarvesterCell.deserialize({
      tileType: SquareType.OPEN,
      value: 1,
      range: 2,
      possibleFeatures: [HarvesterCell.FeatureType.CORN],
    });

    const variableRanges = variableRangeCell.getPossibleGridAssets();

    expect(variableRanges.length).toEqual(2);
    expect(variableRanges[0].serialize()).toEqual({
      tileType: SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [HarvesterCell.FeatureType.CORN],
      startsHidden: false,
    });
    expect(variableRanges[1].serialize()).toEqual({
      tileType: SquareType.OPEN,
      value: 2,
      range: 2,
      possibleFeatures: [HarvesterCell.FeatureType.CORN],
      startsHidden: false,
    });
  });
});
