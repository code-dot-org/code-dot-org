/**
 * @overview React component to allow for easy editing and creation of PlanterCells
 * @see @code-dot-org/maze/src/harvesterCell
 */

import React from 'react';
import CellEditor from './CellEditor';
import PlanterCell from '@code-dot-org/maze/src/planterCell';
import { SquareType } from '@code-dot-org/maze/src/tiles';

export default class PlanterCellEditor extends CellEditor {

  /**
   * @override
   */
  getSelectFieldNames() {
    return ['tileType', 'featureType'];
  }

  /**
   * @override
   */
  renderFields(values) {
    return (
      <div>
        {this.renderTileTypes(values)}

        <label htmlFor="featureType">Feature Type:</label>
        <select name="featureType" value={values.featureType} disabled={this.props.cell.getTile() !== SquareType.OPEN} onChange={this.handleChange}>
          {Object.keys(PlanterCell.FeatureType).map(type => (
            <option key={type} value={PlanterCell.FeatureType[type]}>{type.toLowerCase()}</option>
          ))}
        </select>
      </div>
    );
  }
}
