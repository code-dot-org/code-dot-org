/**
 * @overview React component to allow for easy editing and creation of
 * Bounce maps
 */

import React from 'react';

import {SquareType} from '@cdo/apps/bounce/tiles';

import CellEditor from './CellEditor';

export default class BounceCellEditor extends CellEditor {
  /**
   * @override
   */
  renderFields(values) {
    return <div>{super.renderTileTypes(values, SquareType)}</div>;
  }
}
