import { expect } from '../../util/configuredChai';
import HarvesterCell from '@cdo/apps/maze/harvesterCell';
import { SquareType } from '@cdo/apps/maze/tiles';

describe("HarvesterCell", () => {
  it("has reasonable defaults", () => {
    const cell = new HarvesterCell();

    expect(cell.startsHidden()).to.equal(false);
    expect(cell.isVariable()).to.equal(false);
    expect(cell.featureName()).to.equal('none');
    expect(cell.featureType()).to.equal(HarvesterCell.FeatureType.NONE);
    expect(cell.possibleFeatures_).to.deep.equal([HarvesterCell.FeatureType.NONE]);
  });

  it("can vary on type", () => {
    const variableFeatureCell = HarvesterCell.deserialize({
      tileType: SquareType.OPEN,
      value: 1,
      possibleFeatures: [HarvesterCell.FeatureType.CORN, HarvesterCell.FeatureType.PUMPKIN]
    });

    const variableFeatures = variableFeatureCell.getPossibleGridAssets();

    expect(variableFeatures.length).to.equal(2);
    expect(variableFeatures[0].serialize()).to.deep.equal({
      tileType: SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [HarvesterCell.FeatureType.CORN],
      startsHidden: true
    });
    expect(variableFeatures[1].serialize()).to.deep.equal({
      tileType: SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [HarvesterCell.FeatureType.PUMPKIN],
      startsHidden: true
    });
  });

  it("can vary on quantitiy", () => {
    const variableRangeCell = HarvesterCell.deserialize({
      tileType: SquareType.OPEN,
      value: 1,
      range: 2,
      possibleFeatures: [HarvesterCell.FeatureType.CORN]
    });

    const variableRanges = variableRangeCell.getPossibleGridAssets();

    expect(variableRanges.length).to.equal(2);
    expect(variableRanges[0].serialize()).to.deep.equal({
      tileType: SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [HarvesterCell.FeatureType.CORN],
      startsHidden: false
    });
    expect(variableRanges[1].serialize()).to.deep.equal({
      tileType: SquareType.OPEN,
      value: 2,
      range: 2,
      possibleFeatures: [HarvesterCell.FeatureType.CORN],
      startsHidden: false
    });
  });
});
