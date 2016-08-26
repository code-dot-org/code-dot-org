/**
 * @overview React component to allow for easy editing and creation of
 * PlanterCells
 * @see @cdo/apps/maze/harvesterCell
 */

var React = require('react');
var ReactDOM = require('react-dom');
var PlanterCell = require('@cdo/apps/maze/planterCell');
var tiles = require('@cdo/apps/maze/tiles');
var SquareType = tiles.SquareType;

var PlanterCellEditor = React.createClass({
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
      prev[curr.name] = value;
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
          {Object.keys(SquareType).map(type => (
            <option key={type} value={SquareType[type]}>{type.toLowerCase()}</option>
          ))}
        </select>

        <label htmlFor="featureType">Feature Type:</label>
        <select name="featureType" value={values.featureType} disabled={this.props.cell.getTile() !== SquareType.OPEN} onChange={this.handleChange}>
          {Object.keys(PlanterCell.FeatureType).map(type => (
            <option key={type} value={PlanterCell.FeatureType[type]}>{type.toLowerCase()}</option>
          ))}
        </select>

      </form>
    );
  },
});

module.exports = PlanterCellEditor;
