/**
 * @overview React component to allow for easy editing of Karel Grids.
 * Used in LevelBuilder, and relies on some apps code for validation.
 * Supports both Bee and Farmer skins.
 */
import PropTypes from 'prop-types';
import React from 'react';

import {cells, utils as mazeUtils} from '@code-dot-org/maze';

var StudioCell = require('@cdo/apps/studio/cell');

var HarvesterCellEditor = require('./HarvesterCellEditor');
var PlanterCellEditor = require('./PlanterCellEditor');
var BeeCellEditor = require('./BeeCellEditor');
var CellEditor = require('./CellEditor');
var StudioCellEditor = require('./StudioCellEditor');
var StarWarsGridCellEditor = require('./StarWarsGridCellEditor');
var BounceCellEditor = require('./BounceCellEditor');
var Grid = require('./Grid');

class CellJSON extends React.Component {
  static propTypes = {
    serialization: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };

  componentDidUpdate() {
    const node = this.refs.serializedInput;
    node.focus();
    node.select();
  }

  handleChange = event => {
    this.props.onChange(JSON.parse(event.target.value));
  };

  render() {
    return (
      <label>
        Cell JSON (for copy/pasting):
        <input
          type="text"
          value={JSON.stringify(this.props.serialization)}
          ref="serializedInput"
          onChange={this.handleChange}
        />
      </label>
    );
  }
}

export default class GridEditor extends React.Component {
  static propTypes = {
    serializedMaze: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
    maze: PropTypes.arrayOf(PropTypes.array), // maze items can be integers or strings
    initialDirt: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    skin: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    let cells;
    const cellClass = this.getCellClass();

    if (props.serializedMaze) {
      cells = props.serializedMaze.map(row => row.map(cellClass.deserialize));
    } else {
      cells = props.maze.map((row, x) => {
        return row.map((mazeCell, y) => {
          const initialDirtCell = props.initialDirt[x][y];
          return cellClass.parseFromOldValues(mazeCell, initialDirtCell);
        });
      });
    }

    this.state = {
      cells: cells
    };
  }

  getCellClass() {
    if (this.props.skin === 'playlab' || this.props.skin === 'starwarsgrid') {
      return StudioCell;
    } else if (mazeUtils.isBeeSkin(this.props.skin)) {
      return cells.BeeCell;
    } else if (mazeUtils.isHarvesterSkin(this.props.skin)) {
      return cells.HarvesterCell;
    } else if (mazeUtils.isPlanterSkin(this.props.skin)) {
      return cells.PlanterCell;
    }
    return cells.Cell;
  }

  getEditorClass() {
    if (this.props.skin === 'bounce') {
      return BounceCellEditor;
    } else if (this.props.skin === 'playlab') {
      return StudioCellEditor;
    } else if (this.props.skin === 'starwarsgrid') {
      return StarWarsGridCellEditor;
    } else if (mazeUtils.isBeeSkin(this.props.skin)) {
      return BeeCellEditor;
    } else if (mazeUtils.isHarvesterSkin(this.props.skin)) {
      return HarvesterCellEditor;
    } else if (mazeUtils.isPlanterSkin(this.props.skin)) {
      return PlanterCellEditor;
    }
    return CellEditor;
  }

  changeSelection = (row, col) => {
    this.setState({
      selectedRow: row,
      selectedCol: col
    });
  };

  /**
   * Helper method used to update chunks of the grid. Accepts a row and
   * column representing the top left corner from which to begin
   * replacing and a two-dimensional array of serialized cells to update
   * into the grid.
   * @param {number} row
   * @param {number} col
   * @param {Object[][]} newCells
   */
  updateCells(row, col, newCells) {
    if (newCells === undefined || row === undefined || col === undefined) {
      return;
    }

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
    const cells = this.state.cells;
    newCells.forEach((newRow, i) => {
      newRow.forEach((cell, j) => {
        if (cells[row + i] && cells[row + i][col + j]) {
          cells[row + i][col + j] = this.getCellClass().deserialize(cell);
        }
      });
    });

    const serializedData = cells.map(row => row.map(cell => cell.serialize()));

    this.props.onUpdate(serializedData);
    this.setState({
      cells: cells
    });
  }

  /**
   * When a given cell is modified, update the grid
   */
  handleCellChange = newSerializedCellData => {
    const row = this.state.selectedRow;
    const col = this.state.selectedCol;

    // updateCells expects a two-dimentional array
    this.updateCells(row, col, [[newSerializedCellData]]);
  };

  /**
   * "Paste" the cells in our "clipboard" into the grid
   */
  pasteCopiedCells = () => {
    const copiedCells = this.state.copiedCells;
    const row = this.state.selectedRow;
    const col = this.state.selectedCol;
    this.updateCells(row, col, copiedCells);
  };

  /**
   * Store the given cells on our "clipboard"
   */
  setCopiedCells = cells => {
    this.setState({
      copiedCells: cells
    });
  };

  /**
   * Compute the number of unique map configurations, which is the product of the number
   * of options for each Cell.
   */
  computeNumMaps = grid => {
    if (this.props.skin === 'playlab' || this.props.skin === 'starwarsgrid') {
      // Variable map configurations are not supported in these skins.
      return 1;
    }
    let numMaps = 1;
    grid.forEach(row => {
      row.forEach(cell => {
        let numPossibilitiesForCell = cell.getPossibleGridAssets().length;
        numMaps *= numPossibilitiesForCell;
      });
    });
    return numMaps;
  };

  render() {
    const cells = this.state.cells;

    let cellEditor;
    let selectedCellJson;
    let pasteButton;
    const row = this.state.selectedRow;
    const col = this.state.selectedCol;
    if (cells[row] && cells[row][col]) {
      const cell = cells[row][col];
      const EditorClass = this.getEditorClass();
      cellEditor = (
        <EditorClass
          cell={cell}
          row={row}
          col={col}
          onUpdate={this.handleCellChange}
        />
      );
      selectedCellJson = (
        <CellJSON
          serialization={cell.serialize()}
          onChange={this.handleCellChange}
        />
      );
      if (this.state.copiedCells) {
        pasteButton = (
          <button type="button" onClick={this.pasteCopiedCells}>
            {'Paste Selected ' +
              this.state.copiedCells.length +
              'x' +
              this.state.copiedCells[0].length +
              ' Cells'}
          </button>
        );
      }
    }

    const numMaps = this.computeNumMaps(cells);

    return (
      <div className="row">
        <div className="span5">
          <Grid
            cells={cells}
            selectedRow={this.state.selectedRow}
            selectedCol={this.state.selectedCol}
            skin={this.props.skin}
            setCopiedCells={this.setCopiedCells}
            onSelectionChange={this.changeSelection}
          />
          {numMaps > 1 && (
            <p>{`This configuration will generate ${numMaps} maps.
            We run student code against each possible map, so if this number is large,
            performance will suffer.`}</p>
          )}
          {selectedCellJson}
          {pasteButton}
        </div>
        {cellEditor}
      </div>
    );
  }
}

window.dashboard = window.dashboard || {};
window.dashboard.GridEditor = GridEditor;
