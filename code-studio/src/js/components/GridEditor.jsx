/* global React, dashboard */

var BeeCell = require('blockly-mooc/src/maze/beeCell');
var Cell = require('blockly-mooc/src/maze/cell');
var mazeUtils = require('blockly-mooc/src/maze/mazeUtils');
var BeeCellEditor = require('./BeeCellEditor.jsx');
var CellEditor = require('./CellEditor.jsx');

window.dashboard = window.dashboard || {};

window.dashboard.GridEditor = (function (React) {
  return React.createClass({
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
      var row = parseInt(event.target.dataset.row);
      var col = parseInt(event.target.dataset.col);
      this.setState({
        selectedRow: row,
        selectedCol: col,
      });
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

      var tableStyle = {
        borderCollapse: 'separate',
        tableLayout: 'fixed',
        width: 0,
      };

      var rowStyle = {
        height: '40px'
      };

      var tdStyle = {
        width: '40px',
        border: '1px solid #CCC',
        padding: '0 4px 0 4px',
        verticalAlign: 'top',
        overflow: 'hidden',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        textShadow: '-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF',
      };

      var rows = cells.map(function (row, x) {
        var cells = row.map(function (cell, y) {
          var classNames = [];

          var tiles = ['border', 'path', 'start', 'end', 'obstacle'];
          classNames.push(tiles[cell.tileType_]);

          if (mazeUtils.isBeeSkin(this.props.skin)) {
            var conditions = ['', 'flower-or-hive', 'flower-or-nothing', 'hive-or-nothing', 'flower-hive-or-nothing'];
            if (cell.isVariableCloud()) {
              classNames.push('conditional');
              classNames.push(conditions[cell.cloudType_]);
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
        return (<tr style={rowStyle}>
          {cells}
        </tr>);
      }, this);

      var cellEditor;
      var row = this.state.selectedRow;
      var col = this.state.selectedCol;
      if (cells[row] && cells[row][col]) {
        var cell = cells[row][col];
        cellEditor = mazeUtils.isBeeSkin(this.props.skin) ?
            <dashboard.BeeCellEditor cell={cell} row={row} col={col} onUpdate={this.onCellChange} /> :
            <dashboard.CellEditor cell={cell} row={row} col={col} onUpdate={this.onCellChange} />;
      }

      return (<div className="row">
        <table id="mazeTable" className="span5" style={tableStyle}>
          <tbody>
            {rows}
          </tbody>
        </table>
        {cellEditor}
      </div>);
    },
  });
})(React);
