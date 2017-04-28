import {assert} from '../../util/configuredChai';
import HarvesterCell from '@cdo/apps/maze/harvesterCell';
import tiles from '@cdo/apps/maze/tiles';

describe("HarvesterCell", () => {
  it("has reasonable defaults", () => {
    const cell = new HarvesterCell();

    assert.equal(cell.startsHidden(), false);
    assert.equal(cell.isVariable(), false);
    assert.equal(cell.featureName(), 'none');
    assert.equal(cell.featureType(), HarvesterCell.FeatureType.NONE);
    assert.deepEqual(cell.possibleFeatures_, [HarvesterCell.FeatureType.NONE]);
  });

  it("can vary on type", () => {
    const variableFeatureCell = HarvesterCell.deserialize({
      tileType: tiles.SquareType.OPEN,
      value: 1,
      possibleFeatures: [HarvesterCell.FeatureType.CORN, HarvesterCell.FeatureType.PUMPKIN]
    });

    const variableFeatures = variableFeatureCell.getPossibleGridAssets();

    assert.equal(variableFeatures.length, 2);
    assert.deepEqual(variableFeatures[0].serialize(), {
      tileType: tiles.SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [HarvesterCell.FeatureType.CORN],
      startsHidden: true
    });
    assert.deepEqual(variableFeatures[1].serialize(), {
      tileType: tiles.SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [HarvesterCell.FeatureType.PUMPKIN],
      startsHidden: true
    });
  });

  it("can vary on quantitiy", () => {
    const variableRangeCell = HarvesterCell.deserialize({
      tileType: tiles.SquareType.OPEN,
      value: 1,
      range: 2,
      possibleFeatures: [HarvesterCell.FeatureType.CORN]
    });

    const variableRanges = variableRangeCell.getPossibleGridAssets();

    assert.equal(variableRanges.length, 2);
    assert.deepEqual(variableRanges[0].serialize(), {
      tileType: tiles.SquareType.OPEN,
      value: 1,
      range: 1,
      possibleFeatures: [HarvesterCell.FeatureType.CORN],
      startsHidden: false
    });
    assert.deepEqual(variableRanges[1].serialize(), {
      tileType: tiles.SquareType.OPEN,
      value: 2,
      range: 2,
      possibleFeatures: [HarvesterCell.FeatureType.CORN],
      startsHidden: false
    });
  });
});
