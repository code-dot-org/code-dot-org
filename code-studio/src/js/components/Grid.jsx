/* global React */

var mazeUtils = require('@cdo/apps/maze/mazeUtils');

var Cell = React.createClass({
  propTypes: {
    cell: React.PropTypes.object.isRequired,
    row: React.PropTypes.number.isRequired,
    col: React.PropTypes.number.isRequired,
    selected: React.PropTypes.bool.isRequired,
    onSelectionChange: React.PropTypes.func.isRequired,
    skin: React.PropTypes.string.isRequired,
  },

  handleClickCell: function (event) {
    this.props.onSelectionChange(this.props.row, this.props.col);
  },

  render: function () {
    var cell = this.props.cell;

    var classNames = [];
    var tdStyle = {};

    if (this.props.selected) {
      classNames.push('selected');
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

    return (<td className={classNames.join(' ')} onClick={this.handleClickCell} style={tdStyle}>
      {text}
    </td>);
  }
});

var Grid = React.createClass({
  propTypes: {
    cells: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired,
    selectedRow: React.PropTypes.number,
    selectedCol: React.PropTypes.number,
    skin: React.PropTypes.string.isRequired,
    onSelectionChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var tableRows = this.props.cells.map(function (row, x) {
      var tableDatas = row.map(function (cell, y) {
        var selected = this.props.selectedRow === x && this.props.selectedCol === y;

        return (<Cell
          key={'cell-' + x + '-' + y}
          cell={cell}
          row={x}
          col={y}
          selected={selected}
          onSelectionChange={this.props.onSelectionChange}
          skin={this.props.skin}
        />);
      }, this);

      return (<tr key={'row-' + x}>
        {tableDatas}
      </tr>);
    }, this);

    return (<table>
      <tbody>
        {tableRows}
      </tbody>
    </table>);
  }
});
module.exports = Grid;
