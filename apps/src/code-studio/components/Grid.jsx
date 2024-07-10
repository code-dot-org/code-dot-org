import {utils as mazeUtils} from '@code-dot-org/maze';
import PropTypes from 'prop-types';
import React from 'react';

import {
  SquareType,
  WallTypeMask,
  WallCoordRowMask,
  WallCoordRowShift,
  WallCoordColMask,
  WallCoordColShift,
} from '@cdo/apps/studio/constants';

const CELL_WIDTH = 48;
const CELL_HEIGHT = 38;

const studioTiles = {
  [SquareType.OPEN]: 'none',
  [SquareType.SPRITEFINISH]: 'goal',
  [SquareType.SPRITESTART]: 'sprite',
};

// This list is duplicated in StudioCellEditor. See comment there for
// some explanation of why that's not the greatest design.
const studioAvatarList = [
  'dog',
  'cat',
  'penguin',
  'dinosaur',
  'octopus',
  'witch',
  'bat',
  'bird',
  'dragon',
  'squirrel',
  'wizard',
  'alien',
  'ghost',
  'monster',
  'robot',
  'unicorn',
  'zombie',
  'knight',
  'ninja',
  'pirate',
  'caveboy',
  'cavegirl',
  'princess',
  'spacebot',
  'soccergirl',
  'soccerboy',
  'tennisgirl',
  'tennisboy',
];

const karelTiles = ['border', 'path', 'start', 'end', 'obstacle'];
const beeConditions = [
  '',
  'flower-or-hive',
  'flower-or-nothing',
  'hive-or-nothing',
  'flower-hive-or-nothing',
];
const beeFeatures = ['hive', 'flower'];

class Cell extends React.Component {
  static propTypes = {
    cell: PropTypes.object.isRequired,
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    onMouseDown: PropTypes.func.isRequired,
    onMouseOver: PropTypes.func.isRequired,
    onMouseUp: PropTypes.func.isRequired,
    skin: PropTypes.string.isRequired,
    highlighted: PropTypes.bool,
  };

  render() {
    const {cell} = this.props;

    const classNames = [];
    const tdStyle = {};
    let text;

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

      if (
        cell.getTileType() === SquareType.SPRITESTART &&
        cell.sprite_ !== undefined
      ) {
        tdStyle.backgroundImage =
          "url('/blockly/media/skins/studio/" +
          studioAvatarList[cell.sprite_] +
          "_spritesheet_200px.png')";
      }
    } else if (this.props.skin === 'starwarsgrid') {
      if (cell.tileType_ === 1) {
        tdStyle.backgroundImage =
          "url('/blockly/media/skins/hoc2015x/goal.png')";
      } else if (cell.tileType_ === 0x10) {
        tdStyle.backgroundImage =
          "url('/blockly/media/skins/hoc2015x/instructions_bb8.png')";
        tdStyle.backgroundSize = 'cover';
      } else {
        text = WallTypeMask & cell.tileType_ ? '2x' : '';
        const x = (WallCoordColMask & cell.tileType_) >> WallCoordColShift;
        const y = (WallCoordRowMask & cell.tileType_) >> WallCoordRowShift;
        tdStyle.backgroundImage =
          "url('/blockly/media/skins/hoc2015x/tiles_background1.png')";
        tdStyle.backgroundSize = '800% 800%';
        tdStyle.backgroundPosition = `-${x * CELL_WIDTH}px -${
          y * CELL_HEIGHT
        }px`;
      }
    } else if (this.props.skin === 'bounce') {
      const images = [
        'tiles_wall',
        'goal',
        'ball',
        'paddle',
        'paddle',
        'ball',
        'obstacle',
      ];
      if (cell.tileType_) {
        const image = images[Math.log2(cell.tileType_)];
        tdStyle.backgroundImage = `url('/blockly/media/skins/bounce/${image}.png')`;
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
          const dirtValue = cell.getCurrentValue();
          const dirtIndex = 10 + dirtValue + (dirtValue < 0 ? 1 : 0);
          tdStyle.backgroundPosition = -dirtIndex * 50;
        }
      }

      if (cell.originalValue_ !== undefined && cell.originalValue_ !== null) {
        text = cell.originalValue_.toString();
        if (cell.range_ && cell.range_ > cell.originalValue_) {
          text += ' - ' + cell.range_.toString();
        }
      }
    }

    return (
      <td
        className={classNames.join(' ')}
        onClick={this.props.onClick.bind(null, this.props.row, this.props.col)}
        onMouseDown={this.props.onMouseDown.bind(
          null,
          this.props.row,
          this.props.col
        )}
        onMouseOver={this.props.onMouseOver.bind(
          null,
          this.props.row,
          this.props.col
        )}
        onMouseUp={this.props.onMouseUp.bind(
          null,
          this.props.row,
          this.props.col
        )}
        style={tdStyle}
      >
        {text}
      </td>
    );
  }
}

export default class Grid extends React.Component {
  static propTypes = {
    cells: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
    selectedRow: PropTypes.number,
    selectedCol: PropTypes.number,
    skin: PropTypes.string.isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    setCopiedCells: PropTypes.func.isRequired,
  };

  state = {};

  /**
   * When drag begins, record that we are now dragging and where we
   * started from.
   */
  beginDrag = (row, col) => {
    this.setState({
      dragging: true,
      dragStart: {row, col},
    });
  };

  /**
   * As the mouse moves over the cells, if we are dragging then record
   * the latest cell we've moved over so we can highlight all selected
   * cells appropriately.
   */
  moveDrag = (row, col) => {
    if (this.state.dragging) {
      this.setState({
        dragCurrent: {row, col},
      });
    }
  };

  /**
   * Once the drag ends, create a subarray of all selected cells and
   * save it to our parent.
   */
  endDrag = (row, col) => {
    const {dragStart} = this.state;
    this.setState({
      dragging: false,
      dragStart: null,
      dragCurrent: null,
    });

    if (!dragStart || (dragStart.row === row && dragStart.col === col)) {
      return;
    }

    const top = Math.min(dragStart.row, row);
    const left = Math.min(dragStart.col, col);
    const bottom = Math.max(dragStart.row, row);
    const right = Math.max(dragStart.col, col);

    const cells = this.props.cells.slice(top, bottom + 1).map(row => {
      return row.slice(left, right + 1).map(cell => {
        return cell.serialize();
      });
    });

    // It's a bit awkward to have these two competing concepts of what
    // "select" means, and to have the knowledge of copying injected
    // into this component when really it's only GridEditor that cares
    // WHY we're tracking "drag selections".
    // TODO(elijah) Unify "drag select" and "original select"
    this.props.setCopiedCells(cells);
  };

  /**
   * As we are dragging, we can determine if a given x,y coordinate pair
   * is within the area being selected.
   */
  isHighlighting(row, col) {
    if (this.state.dragging && this.state.dragCurrent) {
      return (
        row >= Math.min(this.state.dragStart.row, this.state.dragCurrent.row) &&
        row <= Math.max(this.state.dragStart.row, this.state.dragCurrent.row) &&
        col >= Math.min(this.state.dragStart.col, this.state.dragCurrent.col) &&
        col <= Math.max(this.state.dragStart.col, this.state.dragCurrent.col)
      );
    }
    return false;
  }

  render() {
    const tableRows = this.props.cells.map((row, x) => {
      const tableDatas = row.map((cell, y) => {
        const selected =
          this.props.selectedRow === x && this.props.selectedCol === y;

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

      return <tr key={'row-' + x}>{tableDatas}</tr>;
    });

    return (
      <table>
        <tbody>{tableRows}</tbody>
      </table>
    );
  }
}
