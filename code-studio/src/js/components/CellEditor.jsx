/**
 * @overview React component to allow for easy editing and creation of
 * Cells
 * @see @cdo/apps/maze/cell
 */
/* global React */
var tiles = require('@cdo/apps/maze/tiles');
var SquareType = tiles.SquareType;

var CellEditor = React.createClass({
  propTypes: {
    cell: React.PropTypes.object.isRequired,
    row: React.PropTypes.number.isRequired,
    col: React.PropTypes.number.isRequired,
    onUpdate: React.PropTypes.func.isRequired,
  },

  handleChange: function (event) {
    var values = {};
    var nodes = ReactDOM.findDOMNode(this).querySelectorAll('[name]');
    for (var i = 0, node; (node = nodes[i]); i++) {
      values[node.name] = isNaN(parseInt(node.value)) ? undefined : parseInt(node.value);
    }
    this.props.onUpdate(values);
  },

  render: function () {
    var values = this.props.cell.serialize();

    // We want undefined values that are going to be in <selects> to
    // actually be the STRING 'undefined' rather than the value.
    if (values.tileType === undefined) {
      values.tileType = 'undefined';
    }
    return (
      <form className="span4 offset1">
        <header>
          <strong>Editing Cell ({this.props.row}, {this.props.col})</strong>
        </header>

        <label htmlFor="tileType">Tile Type (required):</label>
        <select name="tileType" value={values.tileType} onChange={this.handleChange}>
          <option value={SquareType.WALL}>wall</option>
          <option value={SquareType.OPEN}>open</option>
          <option value={SquareType.START}>start</option>
          <option value={SquareType.FINISH}>finish</option>
          <option value={SquareType.OBSTACLE}>obstacle</option>
          <option value={SquareType.STARTANDFINISH}>startandfinish</option>
        </select>

        <label htmlFor="value">Value:</label>
        <input type="number" name="value" value={values.value} onChange={this.handleChange} />

        <label htmlFor="range">Range (defaults to value):</label>
        <input type="number" name="range" value={values.range} disabled={values.featureType === 'undefined'} onChange={this.handleChange} />

      </form>
    );
  },
});
module.exports = CellEditor;
