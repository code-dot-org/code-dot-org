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

var CellJSON = React.createClass({
  propTypes: {
    serialization: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  componentDidUpdate: function () {
    var node = this.refs.serializedInput;
    node.focus();
    node.select();
  },

  handleChange: function (event) {
    this.props.onChange(JSON.parse(event.target.value));
  },

  render: function () {
    return (<label>
      Cell JSON (for copy/pasting):
      <input type="text" value={JSON.stringify(this.props.serialization)} ref="serializedInput" onChange={this.handleChange}/>
    </label>);
  }
});

var GridEditor = React.createClass({
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

  getEditorClass: function () {
    return mazeUtils.isBeeSkin(this.props.skin) ? BeeCellEditor : CellEditor;
  },

  changeSelection: function (row, col) {
    this.setState({
      selectedRow: row,
      selectedCol: col
    });
  },

  handleCellChange: function (newSerializedCell) {
    var row = this.state.selectedRow;
    var col = this.state.selectedCol;

    // this is technically a violation of React's "thou shalt not modify
    // state" commandment. The problem here is that we're modifying an
    // element of an element of this.state.cells. We do then immediately
    // update with setState, but it's still at the very least unclean.
    //
    // Some other potential approaches would be to clone our entire
    // array before modifying it or to store the cells in some way that
    // allows us to immutably update them. Storing tham as an object
    // whose keys are their x,y coordinates, for example, and then
    // providing some helper method to retrieve individual cells.
    //
    // Both of those seem a bit unnecessary, so for now this hack will
    // remain.
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
      var EditorClass = this.getEditorClass();
      cellEditor = <EditorClass cell={cell} row={row} col={col} onUpdate={this.handleCellChange} />;
      selectedCellJson = <CellJSON serialization={cell.serialize()} onChange={this.handleCellChange} />;
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
module.exports = GridEditor;

window.dashboard = window.dashboard || {};
window.dashboard.GridEditor = GridEditor;
