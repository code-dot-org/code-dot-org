/**
 * @overview React component to allow for easy editing and creation of BeeCells
 * @see @code-dot-org/maze/src/beeCell
 */

import {cells} from '@code-dot-org/maze';
import React from 'react';

import CellEditor from './CellEditor';

const BeeCell = cells.BeeCell;

export default class BeeCellEditor extends CellEditor {
  /**
   * @override
   */
  getSelectFieldNames() {
    return super
      .getSelectFieldNames()
      .concat(['featureType', 'cloudType', 'flowerColor']);
  }

  /**
   * @override
   */
  getSanitizedValues() {
    const values = super.getSanitizedValues();

    // If the cell is a variable cloud, its feature MUST be variable
    if (this.props.cell.isVariableCloud()) {
      values.featureType = BeeCell.FeatureType.VARIABLE;
    }

    // If the cell has no features, it should have neither value nor
    // range
    if (values.featureType === 'undefined') {
      values.value = '';
      values.range = '';
    }

    // FlowerColor only makes sense if the cell is a flower
    if (!this.props.cell.isFlower()) {
      values.flowerColor = '';
    }

    return values;
  }

  /**
   * @override
   */
  renderFields(values) {
    return (
      <div>
        {super.renderFields(values)}

        <label htmlFor="featureType">Feature Type:</label>
        <select
          name="featureType"
          value={values.featureType}
          disabled={this.props.cell.isVariableCloud()}
          onChange={this.handleChange}
        >
          <option value="undefined">none</option>
          <option value={BeeCell.FeatureType.HIVE}>hive</option>
          <option value={BeeCell.FeatureType.FLOWER}>flower</option>
          <option value={BeeCell.FeatureType.VARIABLE}>variable</option>
        </select>

        <label htmlFor="cloudType">Cloud Type:</label>
        <select
          name="cloudType"
          value={values.cloudType}
          onChange={this.handleChange}
        >
          <option value="undefined">none</option>
          <option value={BeeCell.CloudType.STATIC}>classic</option>
          <option value={BeeCell.CloudType.HIVE_OR_FLOWER}>
            hive or flower
          </option>
          <option value={BeeCell.CloudType.FLOWER_OR_NOTHING}>
            flower or nothing
          </option>
          <option value={BeeCell.CloudType.HIVE_OR_NOTHING}>
            hive or nothing
          </option>
          <option value={BeeCell.CloudType.ANY}>any</option>
        </select>

        <label htmlFor="flowerColor">Flower Color:</label>
        <select
          name="flowerColor"
          value={values.flowerColor}
          disabled={!this.props.cell.isFlower()}
          onChange={this.handleChange}
        >
          <option value="undefined">default</option>
          <option value={BeeCell.FlowerColor.RED}>red</option>
          <option value={BeeCell.FlowerColor.PURPLE}>purple</option>
        </select>
      </div>
    );
  }
}
