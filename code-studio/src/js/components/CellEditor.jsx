/* global React */

var Cell = require('blockly-mooc/src/maze/cell');

window.dashboard = window.dashboard || {};

window.dashboard.CellEditor = (function (React) {
  return React.createClass({
    propTypes: {
      cell: React.PropTypes.object.isRequired,
      row: React.PropTypes.number.isRequired,
      col: React.PropTypes.number.isRequired,
      onUpdate: React.PropTypes.func.isRequired,
    },

    handleChange: function (event) {
      var values = this.props.cell.serialize();
      values[event.target.name] = (event.target.value === 'undefined' || event.target.value === '') ? undefined : parseInt(event.target.value);
      var newCell = Cell.deserialize(values);
      this.props.onUpdate(newCell);
      this.props.cell = newCell;
    },

    render: function () {
      var values = this.props.cell.serialize();
      for (var value in values) {
        if (values[value] === undefined) {
          values[value] = 'undefined';
        }
      }
      return (
        <form className="span4 offset1">
          <header>
            <strong>Editing Cell ({this.props.row}, {this.props.col})</strong>
          </header>

          <label htmlFor="tileType">Tile Type (required):</label>
          <select name="tileType" value={values.tileType} onChange={this.handleChange}>
            <option value="0">wall</option>
            <option value="1">open</option>
            <option value="2">start</option>
            <option value="3">finish</option>
            <option value="4">obstacle</option>
            <option value="5">startandfinish</option>
          </select>

          <label htmlFor="value">Value:</label>
          <input type="number" name="value" value={values.value} onChange={this.handleChange} />

        </form>
      );
    },
  });
})(React);
