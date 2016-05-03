/**
 * @overview React component to allow for easy editing and creation of
 * Studio Cells
 * @see @cdo/apps/studio/cell
 */
/* global React */
var constants = require('@cdo/apps/studio/constants');

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
    ['tileType', 'speed', 'size', 'direction', 'emotion'].forEach(function (value) {
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
          <option value={constants.SquareType.OPEN}>open</option>
          <option value={constants.SquareType.SPRITEFINISH}>goal</option>
          <option value={constants.SquareType.SPRITESTART}>sprite</option>
        </select>

        <label htmlFor="sprite">Sprite:</label>
        <input type="number" name="sprite" min="0" sprite={values.sprite} onChange={this.handleChange} />

        <label htmlFor="speed">Speed: </label>
        <select name="speed" value={values.speed} onChange={this.handleChange}>
          <option value="undefined">default</option>
          {Object.keys(constants.SpriteSpeed).map(function (type) {
            return <option key={type} value={constants.SpriteSpeed[type]}>{type.replace(/_/g, ' ').toLowerCase()}</option>;
          })}
        </select>

        <label htmlFor="size">Size: </label>
        <select name="size" value={values.size} onChange={this.handleChange}>
          <option value="undefined">default</option>
          {Object.keys(constants.SpriteSize).map(function (type) {
            return <option key={type} value={constants.SpriteSize[type]}>{type.replace(/_/g, ' ').toLowerCase()}</option>;
          })}
        </select>

        <label htmlFor="direction">Direction: </label>
        <select name="direction" value={values.direction} onChange={this.handleChange}>
          <option value="undefined">default</option>
          {Object.keys(constants.Direction).map(function (type) {
            return <option key={type} value={constants.Direction[type]}>{type.replace(/_/g, ' ').toLowerCase()}</option>;
          })}
        </select>

        <label htmlFor="emotion">Emotion: </label>
        <select name="emotion" value={values.emotion} onChange={this.handleChange}>
          <option value="undefined">default</option>
          {Object.keys(constants.Emotions).map(function (type) {
            return <option key={type} value={constants.Emotions[type]}>{type.replace(/_/g, ' ').toLowerCase()}</option>;
          })}
        </select>

      </form>
    );
  },
});
module.exports = CellEditor;
