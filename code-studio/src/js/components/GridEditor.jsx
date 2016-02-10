/**
 * @overview React component to allow for easy editing of Karel Grids.
 * Used in LevelBuilder, and relies on some apps code for validation.
 * Supports both Bee and Farmer skins.
 */
/* global React, dashboard */

var BeeCell = require('@cdo/apps/maze/beeCell');
var Cell = require('@cdo/apps/maze/cell');
var mazeUtils = require('@cdo/apps/maze/mazeUtils');

var BeeCellEditor = require('./BeeCellEditor.jsx');
var CellEditor = require('./CellEditor.jsx');

window.dashboard = window.dashboard || {};

window.dashboard.GridEditor = React.createClass({
  propTypes: {
    serializedMaze: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)),
    maze: React.PropTypes.arrayOf(React.PropTypes.array), // maze items can be integers or strings
    initialDirt: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.number)),
    skin: React.PropTypes.string.isRequired,
    onUpdate: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {};
  },

  clickCell: function (event) {
    var selected = this.getDOMNode().querySelector('.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
    event.target.classList.add('selected');
    var row = parseInt(event.target.dataset.row);
    var col = parseInt(event.target.dataset.col);
    this.setState({
      selectedRow: row,
      selectedCol: col,
    });
  },

  handleManualUpdate: function (event) {
    var newCell = BeeCell.deserialize(JSON.parse(event.target.value));
    this.onCellChange(newCell);
  },

  componentDidUpdate: function () {
    var node = this.refs.serializedInput.getDOMNode();
    node.focus();
    node.select();
  },

  onCellChange: function (newCell) {
    var row = this.state.selectedRow;
    var col = this.state.selectedCol;
    var cells = this.getDeserializedCells();
    if (row !== undefined && col !== undefined) {
      cells[row][col] = newCell;
    }
    var serializedData = cells.map(function (row) {
      return row.map(function (cell) {
        return cell.serialize();
      });
    });
    this.props.onUpdate(serializedData);
    this.setState({
      serializedData: serializedData
    });
  },

  getDeserializedCells: function () {
    var cells;

    var cellClass = mazeUtils.isBeeSkin(this.props.skin) ? BeeCell : Cell;

    if (this.state.serializedData) {
      cells = this.state.serializedData.map(function (row) {
        return row.map(cellClass.deserialize);
      });
    } else if (this.props.serializedMaze) {
      cells = this.props.serializedMaze.map(function (row) {
        return row.map(cellClass.deserialize);
      });
    } else {
      cells = this.props.maze.map(function (row, x) {
        return row.map(function (mazeCell, y) {
          var initialDirtCell = this.props.initialDirt[x][y];
          return cellClass.parseFromOldValues(mazeCell, initialDirtCell);
        }, this);
      }, this);
    }

    return cells;
  },

  render: function () {

    var cells = this.getDeserializedCells();

    var rows = cells.map(function (row, x) {
      var cells = row.map(function (cell, y) {
        var classNames = [];
        var tdStyle = {};

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

        return (<td data-row={x} data-col={y} className={classNames.join(' ')} onClick={this.clickCell} style={tdStyle}>
          {text}
        </td>);
      }, this);
      return (<tr>
        {cells}
      </tr>);
    }, this);

    var cellEditor;
    var selectedCellJson;
    var row = this.state.selectedRow;
    var col = this.state.selectedCol;
    if (cells[row] && cells[row][col]) {
      var cell = cells[row][col];
      cellEditor = mazeUtils.isBeeSkin(this.props.skin) ?
          <BeeCellEditor cell={cell} row={row} col={col} onUpdate={this.onCellChange} /> :
          <CellEditor cell={cell} row={row} col={col} onUpdate={this.onCellChange} />;

      selectedCellJson = (<label>
        Cell JSON (for copy/pasting):
        <input type="text" value={JSON.stringify(cell.serialize())} ref="serializedInput" onChange={this.handleManualUpdate}/>
      </label>);
    }

    return (<div className="row">
      <div className="span5">
        <table>
          <tbody>
            {rows}
          </tbody>
        </table>
        {selectedCellJson}
      </div>
      {cellEditor}
    </div>);
  },
});
