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
var Grid = require('./Grid.jsx');

window.dashboard = window.dashboard || {};

var CellJSON = React.createClass({
  propTypes: {
    serialization: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)),
    onChange: React.PropTypes.func.isRequired
  },

  componentDidUpdate: function () {
    var node = this.refs.serializedInput.getDOMNode();
    node.focus();
    node.select();
  },

  onChange: function (event) {
    this.props.onChange(JSON.parse(event.target.value));
  },

  render: function () {
    return (<label>
      Cell JSON (for copy/pasting):
      <input type="text" value={JSON.stringify(this.props.serialization)} ref="serializedInput" onChange={this.onChange}/>
    </label>);
  }
});

window.dashboard.GridEditor = React.createClass({
  propTypes: {
    serializedMaze: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)),
    maze: React.PropTypes.arrayOf(React.PropTypes.array), // maze items can be integers or strings
    initialDirt: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.number)),
    skin: React.PropTypes.string.isRequired,
    onUpdate: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    var cells;
    var cellClass = this.getCellClass();

    if (this.props.serializedMaze) {
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

    return {
      cells: cells
    };
  },

  getCellClass: function () {
    return mazeUtils.isBeeSkin(this.props.skin) ? BeeCell : Cell;
  },

  changeSelection: function (row, col) {
    this.setState({
      selectedRow: row,
      selectedCol: col
    });
  },

  onCellChange: function (newSerializedCell) {
    var row = this.state.selectedRow;
    var col = this.state.selectedCol;

    // this is technically a violation of React's "thou shalt not modify
    // state" commandment.
    // TODO figure out a clean way to do this purely with setState
    var cells = this.state.cells;
    var newCell = this.getCellClass().deserialize(newSerializedCell);
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
      cells: cells
    });
  },

  render: function () {
    var cells = this.state.cells;

    var cellEditor;
    var selectedCellJson;
    var row = this.state.selectedRow;
    var col = this.state.selectedCol;
    if (cells[row] && cells[row][col]) {
      var cell = cells[row][col];
      var EditorClass = mazeUtils.isBeeSkin(this.props.skin) ? BeeCellEditor : CellEditor;
      cellEditor = <EditorClass cell={cell} row={row} col={col} onUpdate={this.onCellChange} />;
      selectedCellJson = <CellJSON serialization={cell.serialize()} onChange={this.onCellChange} />;
    }

    return (<div className="row">
      <div className="span5">
        <Grid cells={cells} selectedRow={this.state.selectedRow} selectedCol={this.state.selectedCol} skin={this.props.skin} onSelectionChange={this.changeSelection}/>
        {selectedCellJson}
      </div>
      {cellEditor}
    </div>);
  },
});
