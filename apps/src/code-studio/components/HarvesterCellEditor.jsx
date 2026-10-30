/**
 * @overview React component to allow for easy editing and creation of HarvesterCells
 * @see @code-dot-org/maze/src/harvesterCell
 */

import {cells} from '@code-dot-org/maze';
import React from 'react';

import CellEditor from './CellEditor';

const HarvesterCell = cells.HarvesterCell;

export default class PlanterCellEditor extends CellEditor {
  /**
   * @override
   */
  renderFields(values) {
    return (
      <div>
        {super.renderFields(values)}

        <label htmlFor="possibleFeatures">Possible Features:</label>
        {Object.keys(HarvesterCell.FeatureType).map(function (type) {
          var value = HarvesterCell.FeatureType[type];
          return (
            <label className="checkbox" key={type}>
              <input
                type="checkbox"
                name="possibleFeatures"
                value={value}
                checked={values.possibleFeatures.includes(value)}
                onChange={this.handleChange}
              />
              {type}
            </label>
          );
        }, this)}

        <label htmlFor="startsHidden">Starts Hidden:</label>
        <input
          style={{margin: 0}}
          type="checkbox"
          name="startsHidden"
          checked={values.startsHidden}
          value={1}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}
