import React from 'react';
var mazeUtils = require('@cdo/apps/maze/mazeUtils');
var studioConstants = require('@cdo/apps/studio/constants');

var studioTiles = {
  [studioConstants.SquareType.OPEN]: 'none',
  [studioConstants.SquareType.SPRITEFINISH]: 'goal',
  [studioConstants.SquareType.SPRITESTART]: 'sprite',
};

// This list is duplicated in StudioCellEditor. See comment there for
// some explanation of why that's not the greatest design.
var studioAvatarList = ["dog", "cat", "penguin", "dinosaur", "octopus",
    "witch", "bat", "bird", "dragon", "squirrel", "wizard", "alien",
    "ghost", "monster", "robot", "unicorn", "zombie", "knight", "ninja",
    "pirate", "caveboy", "cavegirl", "princess", "spacebot", "soccergirl",
    "soccerboy", "tennisgirl", "tennisboy"];

var karelTiles = ['border', 'path', 'start', 'end', 'obstacle'];
var beeConditions = ['', 'flower-or-hive', 'flower-or-nothing', 'hive-or-nothing', 'flower-hive-or-nothing'];
var beeFeatures = ['hive', 'flower'];

var Cell = React.createClass({
  propTypes: {
    cell: React.PropTypes.object.isRequired,
    row: React.PropTypes.number.isRequired,
    col: React.PropTypes.number.isRequired,
    selected: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired,
    onMouseDown: React.PropTypes.func.isRequired,
    onMouseOver: React.PropTypes.func.isRequired,
    onMouseUp: React.PropTypes.func.isRequired,
    skin: React.PropTypes.string.isRequired,
    highlighted: React.PropTypes.bool,
  },

  render: function () {
    var cell = this.props.cell;

    var classNames = [];
    var tdStyle = {};
    var text;

    if (this.props.selected) {
      classNames.push('selected');
    }
    if (this.props.highlighted) {
      classNames.push('highlighted');
    }

    // Cell type-specific stuff
    // TODO(elijah) This area contains a bunch of application-specific
    // logic which would ideally live somewhere more flexible.
    if (this.props.skin === 'playlab') {
      classNames.push('playlab', studioTiles[cell.getTileType()]);

      if (cell.getTileType() === studioConstants.SquareType.SPRITESTART && cell.sprite_ !== undefined) {
        tdStyle.backgroundImage = "url('/blockly/media/skins/studio/" + studioAvatarList[cell.sprite_] + "_spritesheet_200px.png')";
      }
    } else {
      classNames.push(karelTiles[cell.tileType_]);

      if (mazeUtils.isBeeSkin(this.props.skin)) {
        if (cell.isVariableCloud()) {
          classNames.push('conditional');
          classNames.push(beeConditions[cell.cloudType_]);
        } else if (cell.featureType_ !== undefined) {
          classNames.push(beeFeatures[cell.featureType_]);
        }
      } else {
        // farmer
        if (cell.isDirt()) {
          classNames.push('dirt');
          var dirtValue = cell.getCurrentValue();
          var dirtIndex = 10 + dirtValue + (dirtValue < 0 ? 1 : 0);
          tdStyle.backgroundPosition = -dirtIndex * 50;
        }
      }

      if (cell.originalValue_ !== undefined && cell.originalValue_ !== null) {
        text = cell.originalValue_.toString();
        if (cell.range_ && cell.range_ > cell.originalValue_) {
          text += " - " + cell.range_.toString();
        }
      }
    }

    return (
      <td
        className={classNames.join(' ')}
        onClick={this.props.onClick.bind(null, this.props.row, this.props.col)}
        onMouseDown={this.props.onMouseDown.bind(null, this.props.row, this.props.col)}
        onMouseOver={this.props.onMouseOver.bind(null, this.props.row, this.props.col)}
        onMouseUp={this.props.onMouseUp.bind(null, this.props.row, this.props.col)}
        style={tdStyle}
      >
        {text}
      </td>
    );
  }
});

var Grid = React.createClass({
  propTypes: {
    cells: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired,
    selectedRow: React.PropTypes.number,
    selectedCol: React.PropTypes.number,
    skin: React.PropTypes.string.isRequired,
    onSelectionChange: React.PropTypes.func.isRequired,
    setCopiedCells: React.PropTypes.func.isRequired,
  },

  getInitialState: () => ({}),

  /**
   * When drag begins, record that we are now dragging and where we
   * started from.
   */
  beginDrag: function (row, col) {
    this.setState({
      dragging: true,
      dragStart: {row, col},
    });
  },

  /**
   * As the mouse moves over the cells, if we are dragging then record
   * the latest cell we've moved over so we can highlight all selected
   * cells appropriately.
   */
  moveDrag: function (row, col) {
    if (this.state.dragging) {
      this.setState({
        dragCurrent: {row, col},
      });
    }
  },

  /**
   * Once the drag ends, create a subarray of all selected cells and
   * save it to our parent.
   */
  endDrag: function (row, col) {
    var dragStart = this.state.dragStart;
    this.setState({
      dragging: false,
      dragStart: null,
      dragCurrent: null
    });

    if (!dragStart || dragStart.row === row && dragStart.col === col) {
      return;
    }

    var top = Math.min(dragStart.row, row),
        left = Math.min(dragStart.col, col),
        bottom = Math.max(dragStart.row, row),
        right = Math.max(dragStart.col, col);

    var cells = this.props.cells.slice(top, bottom + 1).map((row) => {
      return row.slice(left, right + 1).map((cell) => {
        return cell.serialize();
      });
    });

    // It's a bit awkward to have these two competing concepts of what
    // "select" means, and to have the knowledge of copying injected
    // into this component when really it's only GridEditor that cares
    // WHY we're tracking "drag selections".
    // TODO(elijah) Unify "drag select" and "original select"
    this.props.setCopiedCells(cells);
  },

  /**
   * As we are dragging, we can determine if a given x,y coordinate pair
   * is within the area being selected.
   */
  isHighlighting: function (row, col) {
    if (this.state.dragging && this.state.dragCurrent) {
      return row >= Math.min(this.state.dragStart.row, this.state.dragCurrent.row) &&
             row <= Math.max(this.state.dragStart.row, this.state.dragCurrent.row) &&
             col >= Math.min(this.state.dragStart.col, this.state.dragCurrent.col) &&
             col <= Math.max(this.state.dragStart.col, this.state.dragCurrent.col);
    }
    return false;
  },

  render: function () {
    var tableRows = this.props.cells.map((row, x) => {
      var tableDatas = row.map((cell, y) => {
        var selected = this.props.selectedRow === x && this.props.selectedCol === y;

        return (
          <Cell
            key={'cell-' + x + '-' + y}
            cell={cell}
            row={x}
            col={y}
            selected={selected}
            highlighted={this.isHighlighting(x, y)}
            onClick={this.props.onSelectionChange}
            onMouseDown={this.beginDrag}
            onMouseOver={this.moveDrag}
            onMouseUp={this.endDrag}
            skin={this.props.skin}
          />
        );
      });

      return (
        <tr key={'row-' + x}>
          {tableDatas}
        </tr>
      );
    });

    return (
      <table>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    );
  }
});
module.exports = Grid;
