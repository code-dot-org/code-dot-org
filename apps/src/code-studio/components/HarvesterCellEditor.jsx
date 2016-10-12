/**
 * @overview React component to allow for easy editing and creation of
 * HarvesterCells
 * @see @cdo/apps/maze/harvesterCell
 */

var React = require('react');
var ReactDOM = require('react-dom');
var HarvesterCell = require('@cdo/apps/maze/harvesterCell');
var tiles = require('@cdo/apps/maze/tiles');
var SquareType = tiles.SquareType;

var HarvesterCellEditor = React.createClass({
  propTypes: {
    cell: React.PropTypes.object.isRequired,
    row: React.PropTypes.number.isRequired,
    col: React.PropTypes.number.isRequired,
    onUpdate: React.PropTypes.func.isRequired,
  },

  handleChange: function (event) {
    var serializedArray = $(ReactDOM.findDOMNode(this)).serializeArray();
    var values = serializedArray.reduce((prev, curr) => {
      var value = isNaN(curr.value) ? undefined : Number(curr.value);
      if (curr.name in prev) {
        if (Array.isArray(prev[curr.name])) {
          prev[curr.name].push(value);
        } else {
          prev[curr.name] = [prev[curr.name], value];
        }
      } else {
        prev[curr.name] = value;
      }
      return prev;
    }, {});
    this.props.onUpdate(values);
  },

  /**
   * Focus and select the input that contains this cell's serialized
   * JSON representation on creation or update, to provide a convenient
   * copy/paste update route.
   */

  render: function () {
    var values = this.props.cell.serialize();

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
          <option value={SquareType.WALL}>wall</option>
          <option value={SquareType.OPEN}>open</option>
          <option value={SquareType.START}>start</option>
          <option value={SquareType.OBSTACLE}>obstacle</option>
        </select>

        <label htmlFor="possibleFeatures">Possible Features:</label>
        {Object.keys(HarvesterCell.FeatureType).map(function (type) {
          var value = HarvesterCell.FeatureType[type];
          return (
            <label className="checkbox" key={type}>
              <input type="checkbox" name="possibleFeatures" value={value} checked={values.possibleFeatures.includes(value)} onChange={this.handleChange} />
              {type}
            </label>
          );
        }, this)}

        <label htmlFor="startsHidden">Starts Hidden:</label>
        <input style={{margin: 0}} type="checkbox" name="startsHidden" checked={values.startsHidden} value={1} onChange={this.handleChange} />

        <label htmlFor="value">Value:</label>
        <input type="number" name="value" min="0" value={values.value} onChange={this.handleChange} />

        <label htmlFor="range">Range (defaults to value):</label>
        <input type="number" name="range" min={values.value} value={values.range} onChange={this.handleChange} />
      </form>
    );
  },
});

module.exports = HarvesterCellEditor;
