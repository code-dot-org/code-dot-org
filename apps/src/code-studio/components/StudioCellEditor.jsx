/**
 * @overview React component to allow for easy editing and creation of
 * Studio Cells
 * @see @cdo/apps/studio/cell
 */
import {
  Direction,
  Emotions,
  SpriteSize,
  SpriteSpeed,
  SquareType
} from '@cdo/apps/studio/constants';
var React = require('react');
var ReactDOM = require('react-dom');

// TODO elijah this list is pulled from
// @cdo/apps/studio/skins:loadStudio(), where it is hardcoded as the
// list of avatars for the Code Studio Playlab Skin. The list is
// duplicated in Grid.jsx for the purposes of displaying the sprites.
// Ideally, both of these templates would just be referencing a more
// publically-accessible list in apps code.
// Even more ideally, this editor would be expanded to support any of
// our skins, but that will likely require a bit of a refactor in the
// way we handle skins, and is unjustifiable for now, since the
// Playlab-skinned levels are currently the only ones we edit with this
// interface.
var avatarList = ["dog", "cat", "penguin", "dinosaur", "octopus",
    "witch", "bat", "bird", "dragon", "squirrel", "wizard", "alien",
    "ghost", "monster", "robot", "unicorn", "zombie", "knight",
    "ninja", "pirate", "caveboy", "cavegirl", "princess", "spacebot",
    "soccergirl", "soccerboy", "tennisgirl", "tennisboy"];

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
      values[node.name] = isNaN(parseInt(node.value)) ? undefined : Number(node.value);
    }
    this.props.onUpdate(values);
  },

  render: function () {
    var values = this.props.cell.serialize();

    // We want undefined values that are going to be in <selects> to
    // actually be the STRING 'undefined' rather than the value.
    ['tileType', 'speed', 'size', 'direction', 'emotion', 'sprite'].forEach(value => {
      if (values[value] === undefined) {
        values[value] = 'undefined';
      }
    });

    var spriteAttributes;

    return (
      <form className="span4 offset1">
        <header>
          <strong>Editing Cell ({this.props.row}, {this.props.col})</strong>
        </header>

        <label htmlFor="tileType">Tile Type (required):</label>
        <select name="tileType" value={values.tileType} onChange={this.handleChange}>
          <option value={SquareType.OPEN}>open</option>
          <option value={SquareType.SPRITEFINISH}>goal</option>
          <option value={SquareType.SPRITESTART}>sprite</option>
        </select>

        {(values.tileType === SquareType.SPRITESTART) &&
          <div>
            <label htmlFor="sprite">Sprite:</label>
            <select name="sprite" value={values.sprite} onChange={this.handleChange}>
              <option value="undefined">default</option>
              {avatarList.map((sprite, i) => {
                return <option key={sprite} value={i}>{sprite}</option>;
              })}
            </select>

            <label htmlFor="speed">Speed: </label>
            <select name="speed" value={values.speed} onChange={this.handleChange}>
              <option value="undefined">default</option>
              {Object.keys(SpriteSpeed).map(type => {
                return <option key={type} value={SpriteSpeed[type]}>{type.replace(/_/g, ' ').toLowerCase()}</option>;
              })}
            </select>

            <label htmlFor="size">Size: </label>
            <select name="size" value={values.size} onChange={this.handleChange}>
              <option value="undefined">default</option>
              {Object.keys(SpriteSize).map(type => {
                return <option key={type} value={SpriteSize[type]}>{type.replace(/_/g, ' ').toLowerCase()}</option>;
              })}
            </select>

            <label htmlFor="direction">Direction: </label>
            <select name="direction" value={values.direction} onChange={this.handleChange}>
              <option value="undefined">default</option>
              {Object.keys(Direction).map(type => {
                return <option key={type} value={Direction[type]}>{type.replace(/_/g, ' ').toLowerCase()}</option>;
              })}
            </select>

            <label htmlFor="emotion">Emotion: </label>
            <select name="emotion" value={values.emotion} onChange={this.handleChange}>
              <option value="undefined">default</option>
              {Object.keys(Emotions).map(type => {
                return <option key={type} value={Emotions[type]}>{type.replace(/_/g, ' ').toLowerCase()}</option>;
              })}
            </select>
          </div>
        }

      </form>
    );
  },
});
module.exports = CellEditor;
