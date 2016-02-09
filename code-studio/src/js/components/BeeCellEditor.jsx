/* global React */

var BeeCell = require('blockly-mooc/src/maze/beeCell');

window.dashboard = window.dashboard || {};

window.dashboard.BeeCellEditor = (function (React) {
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
      var newCell = BeeCell.deserialize(values);
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

          <label htmlFor="featureType">Feature Type:</label>
          <select name="featureType" value={values.featureType} onChange={this.handleChange}>
            <option value="undefined">none</option>
            <option value="0">hive</option>
            <option value="1">flower</option>
            <option value="2">variable</option>
          </select>

          <label htmlFor="value">Value (requires feature):</label>
          <input type="number" name="value" value={values.value} onChange={this.handleChange} />

          <label htmlFor="range">Range (defaults to value):</label>
          <input type="number" name="range" value={values.range} onChange={this.handleChange} />

          <label htmlFor="cloudType">Cloud Type:</label>
          <select name="cloudType" value={values.cloudType} onChange={this.handleChange}>
            <option value='undefined'>none</option> 
            <option value="0">classic</option>
            <option value="1">hive or flower</option>
            <option value="2">flower or nothing</option>
            <option value="3">hive or nothing</option>
            <option value="4">any</option>
          </select>

          <label htmlFor="flowerColor">Flower Color:</label>
          <select name="flowerColor" value={values.flowerColor} onChange={this.handleChange}>
            <option value="undefined">default</option> 
            <option value="0">red</option>
            <option value="1">purple</option>
          </select>

        </form>
      );
    },
  });
})(React);
