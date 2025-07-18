import HarvesterCell, {FeatureType} from '../HarvesterCell';
import {SquareType} from '../tiles';

describe('HarvesterCell', () => {
  it('has reasonable defaults', () => {
    const cell = new HarvesterCell(0);

    expect(cell.startsHidden()).toEqual(false);
    expect(cell.isVariable()).toEqual(false);
    expect(cell.featureName()).toEqual('none');
    expect(cell.featureType()).toEqual(FeatureType.NONE);
    expect(cell.possibleFeatures_).toEqual([FeatureType.NONE]);
  });

  it('can vary on type', () => {
    const variableFeatureCell = HarvesterCell.deserialize({
      tileType: SquareType.OPEN,
      value: 1,
      possibleFeatures: [FeatureType.CORN, FeatureType.PUMPKIN],
    });

    const variableFeatures = variableFeatureCell.getPossibleGridAssets();

    expect(variableFeatures.length).toEqual(2);
    expect(variableFeatures[0].serialize()).toEqual({
      tileType: SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [FeatureType.CORN],
      startsHidden: true,
    });
    expect(variableFeatures[1].serialize()).toEqual({
      tileType: SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [FeatureType.PUMPKIN],
      startsHidden: true,
    });
  });

  it('can vary on quantitiy', () => {
    const variableRangeCell = HarvesterCell.deserialize({
      tileType: SquareType.OPEN,
      value: 1,
      range: 2,
      possibleFeatures: [FeatureType.CORN],
    });

    const variableRanges = variableRangeCell.getPossibleGridAssets();

    expect(variableRanges.length).toEqual(2);
    expect(variableRanges[0].serialize()).toEqual({
      tileType: SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [FeatureType.CORN],
      startsHidden: false,
    });
    expect(variableRanges[1].serialize()).toEqual({
      tileType: SquareType.OPEN,
      value: 2,
      range: 2,
      possibleFeatures: [FeatureType.CORN],
      startsHidden: false,
    });
  });
});
