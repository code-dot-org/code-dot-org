/**
 * @overview React component to allow for easy editing and creation of Cells.
 * can be extended to allow for editing of various specialized kinds of cells.
 * @see @cdo/apps/maze/cell
 */
import React, {PropTypes} from 'react';
import { SquareType } from '@cdo/apps/maze/tiles';

export default class CellEditor extends React.Component {
  static propTypes = {
    cell: PropTypes.object.isRequired,
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    onUpdate: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange() {
    // Serialize the form data to an iterator
    const formData = new FormData(this.form);

    // Convert the iterator to an array and reduce it to an object, combining
    // duplicate names when appropriate (ie for checkboxes)
    const values = Array.from(formData).reduce((serialized, [name, value]) => {
      if (value === "undefined") {
        value = undefined;
      } else {
        value = isNaN(value) ? '' : Number(value);
      }

      if (name in serialized) {
        if (Array.isArray(serialized[name])) {
          serialized[name].push(value);
        } else {
          serialized[name] = [serialized[name], value];
        }
      } else {
        serialized[name] = value;
      }

      return serialized;
    }, {});

    this.props.onUpdate(values);
  }

  /**
   * Get an array of the names of the select fields created by the render
   * method; used to sanitize the values that are going to be passed to the
   * renderFields helper method.
   *
   * @return {String[]}
   */
  getSelectFieldNames() {
    return ['tileType'];
  }

  /**
   * Get a sanitized set of name:value pairs for rendering; by default, simply
   * sets undefined values that are intended to go into <select/>s to the string
   * 'undefined' so we aren't trying to switch them from uncontrolled to
   * controlled components at runtime.
   *
   * Can be overridden by inheriting classes to do more complex sanitization.
   * see BeeCellEditor for an example
   *
   * @return {Object}
   */
  getSanitizedValues() {
    const values = this.props.cell.serialize();

    // We want undefined values that are going to be in <selects> to
    // actually be the STRING 'undefined' rather than the value.
    this.getSelectFieldNames().forEach(value => {
      if (values[value] === undefined) {
        values[value] = 'undefined';
      }
    });

    return values;
  }

  /**
   * Render just the tileTypes selector; this helper method is provided because,
   * unlike value and range, tileTypes are used by all inheriting classes.
   *
   * @param {Object} values - this.getSanitizedValues()
   * @param {Object} squareType - key/value pairs representing the tile types to
   *        render. Defaults to maze.tiles.SquareType
   * @return {Element}
   */
  renderTileTypes(values, squareTypes=SquareType) {
    return (
      <div>
        <label htmlFor="tileType">Tile Type (required):</label>
        <select name="tileType" value={values.tileType} onChange={this.handleChange}>
          {Object.keys(squareTypes).map(key => (
            <option key={key} value={squareTypes[key]}>{key.toLowerCase()}</option>
          ))}
        </select>
      </div>
    );
  }

  /**
   * Render all fields for this form. Most children will want to override this
   * method rather than the higher-level render method to automatically get the
   * sanitized values and header display.
   *
   * @param {Object} values - this.getSanitizedValues()
   * @return {Element}
   */
  renderFields(values) {
    return (
      <div>
        {this.renderTileTypes(values)}

        <label htmlFor="value">Value:</label>
        <input type="number" name="value" value={values.value} onChange={this.handleChange} />

        <label htmlFor="range">Range (defaults to value):</label>
        <input type="number" name="range" value={values.range} disabled={values.featureType === 'undefined'} onChange={this.handleChange} />
      </div>
    );
  }

  render() {
    return (
      <form className="span4 offset1" ref={(form) => {this.form = form;}}>
        <header>
          <strong>Editing Cell ({this.props.row}, {this.props.col})</strong>
        </header>

        {this.renderFields(this.getSanitizedValues())}
      </form>
    );
  }
}
