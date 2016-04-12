/**
 * @overview React component to allow for easy editing and creation of
 * BeeCells
 * @see @cdo/apps/maze/beeCell
 */
/* global React */

var BeeCell = require('@cdo/apps/maze/beeCell');
var tiles = require('@cdo/apps/maze/tiles');
var SquareType = tiles.SquareType;

var BeeCellEditor = React.createClass({
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
    this.props.onUpdate(values);
  },

  /**
   * Focus and select the input that contains this cell's serialized
   * JSON representation on creation or update, to provide a convenient
   * copy/paste update route.
   */

  render: function () {
    var values = this.props.cell.serialize();

    // If the cell is a variable cloud, its feature MUST be variable
    if (this.props.cell.isVariableCloud()) {
      values.featureType = BeeCell.FeatureType.VARIABLE;
    }

    // If the cell has no features, it should have neither value nor
    // range
    if (values.featureType === undefined) {
      values.value = undefined;
      values.range = undefined;
    }

    // FlowerColor only makes sense if the cell is a flower
    if (!this.props.cell.isFlower()) {
      values.flowerColor = undefined;
    }

    // We want undefined values that are going to be in <selects> to
    // actually be the STRING 'undefined' rather than the value.
    ['tileType', 'featureType', 'cloudType', 'flowerColor'].forEach(function (value) {
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
          <option value={SquareType.FINISH}>finish</option>
          <option value={SquareType.OBSTACLE}>obstacle</option>
          <option value={SquareType.STARTANDFINISH}>startandfinish</option>
        </select>

        <label htmlFor="featureType">Feature Type:</label>
        <select name="featureType" value={values.featureType} disabled={this.props.cell.isVariableCloud()} onChange={this.handleChange}>
          <option value="undefined">none</option>
          <option value={BeeCell.FeatureType.HIVE}>hive</option>
          <option value={BeeCell.FeatureType.FLOWER}>flower</option>
          <option value={BeeCell.FeatureType.VARIABLE}>variable</option>
        </select>

        <label htmlFor="value">Value:</label>
        <input type="number" name="value" min="0" value={values.value} disabled={values.featureType === 'undefined'} onChange={this.handleChange} />

        <label htmlFor="range">Range (defaults to value):</label>
        <input type="number" name="range" min={values.value} value={values.range} disabled={values.featureType === 'undefined'} onChange={this.handleChange} />

        <label htmlFor="cloudType">Cloud Type:</label>
        <select name="cloudType" value={values.cloudType} onChange={this.handleChange}>
          <option value="undefined">none</option>
          <option value={BeeCell.CloudType.STATIC}>classic</option>
          <option value={BeeCell.CloudType.HIVE_OR_FLOWER}>hive or flower</option>
          <option value={BeeCell.CloudType.FLOWER_OR_NOTHING}>flower or nothing</option>
          <option value={BeeCell.CloudType.HIVE_OR_NOTHING}>hive or nothing</option>
          <option value={BeeCell.CloudType.ANY}>any</option>
        </select>

        <label htmlFor="flowerColor">Flower Color:</label>
        <select name="flowerColor" value={values.flowerColor} disabled={!this.props.cell.isFlower()} onChange={this.handleChange}>
          <option value="undefined">default</option>
          <option value={BeeCell.FlowerColor.RED}>red</option>
          <option value={BeeCell.FlowerColor.PURPLE}>purple</option>
        </select>
      </form>
    );
  },
});

module.exports = BeeCellEditor;
