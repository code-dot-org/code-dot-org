/**
 * @overview React component to allow for easy editing and creation of
 * BeeCells
 * @see @cdo/apps/maze/beeCell
 */
/* global React */

var BeeCellEditor = module.exports = React.createClass({
  propTypes: {
    cell: React.PropTypes.object.isRequired,
    row: React.PropTypes.number.isRequired,
    col: React.PropTypes.number.isRequired,
    onUpdate: React.PropTypes.func.isRequired,
  },

  handleChange: function (event) {
    var values = {};
    var nodes = this.getDOMNode().querySelectorAll('[name]');
    for (var i = 0, node; (node = nodes[i]); i++) {
      values[node.name] = isNaN(node.value) ? undefined : parseInt(node.value);
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
      values.featureType = 2;
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

    // stringify undefined values so they play nicely with the <select>s
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

        <label htmlFor="featureType">Feature Type:</label>
        <select name="featureType" value={values.featureType} disabled={this.props.cell.isVariableCloud()} onChange={this.handleChange}>
          <option value="undefined">none</option>
          <option value="0">hive</option>
          <option value="1">flower</option>
          <option value="2">variable</option>
        </select>

        <label htmlFor="value">Value:</label>
        <input type="number" name="value" value={values.value} disabled={values.featureType === 'undefined'} onChange={this.handleChange} />

        <label htmlFor="range">Range (defaults to value):</label>
        <input type="number" name="range" value={values.range} disabled={values.featureType === 'undefined'} onChange={this.handleChange} />

        <label htmlFor="cloudType">Cloud Type:</label>
        <select name="cloudType" value={values.cloudType} onChange={this.handleChange}>
          <option value="undefined">none</option>
          <option value="0">classic</option>
          <option value="1">hive or flower</option>
          <option value="2">flower or nothing</option>
          <option value="3">hive or nothing</option>
          <option value="4">any</option>
        </select>

        <label htmlFor="flowerColor">Flower Color:</label>
        <select name="flowerColor" value={values.flowerColor} disabled={!this.props.cell.isFlower()} onChange={this.handleChange}>
          <option value="undefined">default</option> 
          <option value="0">red</option>
          <option value="1">purple</option>
        </select>
      </form>
    );
  },
});
