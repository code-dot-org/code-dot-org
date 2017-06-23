/**
 * @overview React component to allow for easy editing and creation of
 * Bounce maps
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { SquareType } from '@cdo/apps/bounce/tiles';

export default class BounceCellEditor extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const serializedArray = $(ReactDOM.findDOMNode(this)).serializeArray();
    const values = serializedArray.reduce((prev, curr) => {
      const value = isNaN(curr.value) ? undefined : Number(curr.value);
      prev[curr.name] = value;
      return prev;
    }, {});
    this.props.onUpdate(values);
  }

  render() {
    const values = this.props.cell.serialize();

    // We want undefined values that are going to be in <selects> to
    // actually be the STRING 'undefined' rather than the value.
    ['tileType'].forEach(function (value) {
      if (values[value] === undefined) {
        values[value] = 'undefined';
      }
    });

    return (
      <form className="span4 offset1">
        <header>
          <strong>Editing Cell ({this.props.row}, {this.props.col})</strong>
        </header>

        <label htmlFor="tileType">Tile Type (required):</label>
        <select name="tileType" value={values.tileType} onChange={this.handleChange}>
          {Object.keys(SquareType).map(type => (
            <option key={type} value={SquareType[type]}>{type.toLowerCase()}</option>
          ))}
        </select>
      </form>
    );
  }
}

BounceCellEditor.propTypes = {
  cell: React.PropTypes.object.isRequired,
  row: React.PropTypes.number.isRequired,
  col: React.PropTypes.number.isRequired,
  onUpdate: React.PropTypes.func.isRequired,
};
