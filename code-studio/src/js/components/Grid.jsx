/* global React */

var mazeUtils = require('@cdo/apps/maze/mazeUtils');

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
  },

  render: function () {
    var cell = this.props.cell;

    var classNames = [];
    var tdStyle = {};

    if (this.props.selected) {
      classNames.push('selected');
    }
    if (this.props.highlighted) {
      classNames.push('highlighted');
    }

    var tiles = ['border', 'path', 'start', 'end', 'obstacle'];
    classNames.push(tiles[cell.tileType_]);

    if (mazeUtils.isBeeSkin(this.props.skin)) {
      var conditions = ['', 'flower-or-hive', 'flower-or-nothing', 'hive-or-nothing', 'flower-hive-or-nothing'];
      var features = ['hive', 'flower'];
      if (cell.isVariableCloud()) {
        classNames.push('conditional');
        classNames.push(conditions[cell.cloudType_]);
      } else if (cell.featureType_ !== undefined) {
        classNames.push(features[cell.featureType_]);
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

    var text = '';
    if (cell.originalValue_ !== undefined && cell.originalValue_ !== null) {
      text = cell.originalValue_.toString();
      if (cell.range_ && cell.range_ > cell.originalValue_) {
        text += " - " + cell.range_.toString();
      }
    }

    return (
      <td
          className={classNames.join(' ')}
          onClick={this.props.onClick.bind(null, this.props.row, this.props.col)}
          onMouseDown={this.props.onMouseDown.bind(null, this.props.row, this.props.col)}
          onMouseOver={this.props.onMouseOver.bind(null, this.props.row, this.props.col)}
          onMouseUp={this.props.onMouseUp.bind(null, this.props.row, this.props.col)}
          style={tdStyle}>
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

  getInitialState: function () {
    return {};
  },

  /**
   * When drag begins, record that we are now dragging and where we
   * started from.
   */
  beginDrag: function (row, col) {
    this.setState({
      dragging: true,
      dragStart: {row: row, col: col},
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
        dragCurrent: {row: row, col: col},
      });
    }
  },

  /**
   * Once the drag ends, create a subarray of all selected cells and
   * save it to our parent.
   */
  endDrag: function (row, col) {
    var from = this.state.dragStart;
    this.setState({
      dragging: false,
      dragStart: null,
      dragCurrent: null
    });

    if (!from || from.row == row && from.col == col) {
      return;
    }

    var top = Math.min(from.row, row),
        left = Math.min(from.col, col),
        bottom = Math.max(from.row, row),
        right = Math.max(from.col, col);

    var cells = this.props.cells.slice(top, bottom + 1).map(function (row) {
      return row.slice(left, right + 1).map(function (cell) {
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
    var tableRows = this.props.cells.map(function (row, x) {
      var tableDatas = row.map(function (cell, y) {
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
      }, this);

      return (
        <tr key={'row-' + x}>
          {tableDatas}
        </tr>
      );
    }, this);

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
