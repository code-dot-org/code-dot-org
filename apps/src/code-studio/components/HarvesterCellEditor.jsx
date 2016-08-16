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
    var values = {};
    var nodes = ReactDOM.findDOMNode(this).querySelectorAll('[name]');
    // see "Iterating over Node Lists" here for an explanation of this
    // strange-looking for loop
    // https://google.github.io/styleguide/javascriptguide.xml?showone=Tips_and_Tricks#Tips_and_Tricks
    for (var i = 0, node; (node = nodes[i]); i++) {
      values[node.name] = isNaN(node.value) ? undefined : Number(node.value);
    }
    console.log(values);
    this.props.onUpdate(values);
  },

  /**
   * Focus and select the input that contains this cell's serialized
   * JSON representation on creation or update, to provide a convenient
   * copy/paste update route.
   */

  render: function () {
    var values = this.props.cell.serialize();

    // If the cell has no features, it should have neither value nor
    // range
    if (values.featureType === undefined) {
      values.value = undefined;
      values.range = undefined;
    }

    // We want undefined values that are going to be in <selects> to
    // actually be the STRING 'undefined' rather than the value.
    ['tileType', 'featureType'].forEach(function (value) {
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
        </select>

        <label htmlFor="featureType">Feature Type:</label>
        <select name="featureType" value={values.featureType} onChange={this.handleChange}>
          {Object.keys(HarvesterCell.FeatureType).map(function (type) {
            var value = HarvesterCell.FeatureType[type];
            if (value === undefined) {
              value = 'undefined';
            }
            return (<option value={value}>{type}</option>);
          })}
        </select>

        <label htmlFor="value">Value:</label>
        <input type="number" name="value" min="0" value={values.value} disabled={values.featureType === 'undefined'} onChange={this.handleChange} />

        <label htmlFor="range">Range (defaults to value):</label>
        <input type="number" name="range" min={values.value} value={values.range} disabled={values.featureType === 'undefined'} onChange={this.handleChange} />
      </form>
    );
  },
});

module.exports = HarvesterCellEditor;
