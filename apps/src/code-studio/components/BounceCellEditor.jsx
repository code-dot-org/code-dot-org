/**
 * @overview React component to allow for easy editing and creation of
 * Bounce maps
 */

import React from 'react';
import CellEditor from './CellEditor';
import { SquareType } from '@cdo/apps/bounce/tiles';

export default class BounceCellEditor extends CellEditor  {

  /**
   * @override
   */
  renderFields(values) {
    return (
      <div>
        {super.renderTileTypes(values, SquareType)}
      </div>
    );
  }
}
