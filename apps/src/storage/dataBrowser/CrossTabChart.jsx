import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';

class CrossTabChart extends React.Component {
  static propTypes = {
    parsedRecords: PropTypes.array.isRequired,
    numericColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    rowName: PropTypes.string.isRequired,
    columnName: PropTypes.string.isRequired
  };

  /**
   * @param {Array.<Object>} records
   * @param {string} rowName
   * @param {string} columnName
   */
  createPivotTable = (records, rowName, columnName) => {
    let countMap = {};

    // Find all values in columnName - these will be the columns of the pivot table
    const pivotedColumns = new Set(records.map(record => record[columnName]));

    // Count occurrences of each row/column pair
    records.forEach(record => {
      let key = record[rowName];
      let value = record[columnName];
      if (!countMap[key]) {
        countMap[key] = {[rowName]: key};
        pivotedColumns.forEach(column => (countMap[key][column] = 0));
      }
      countMap[key][value]++;
    });

    // Sort columns
    let columns;
    if (this.props.numericColumns.includes(columnName)) {
      columns = [...pivotedColumns].sort(function(a, b) {
        return a - b;
      });
    } else {
      columns = [...pivotedColumns].sort();
    }
    columns.unshift(rowName);

    // Sort rows
    let chartData = Object.values(countMap).sort((a, b) =>
      a[rowName] > b[rowName] ? 1 : -1
    );
    return {chartData, columns};
  };

  render() {
    if (
      !this.props.parsedRecords ||
      !this.props.rowName ||
      !this.props.columnName
    ) {
      return null;
    }
    const {chartData, columns} = this.createPivotTable(
      this.props.parsedRecords,
      this.props.rowName,
      this.props.columnName
    );

    return (
      <table>
        <tbody>
          <tr>
            {columns.map(column => (
              <th key={column}>{column}</th>
            ))}
          </tr>
          {chartData.map((record, id) => (
            <tr key={id}>
              {columns.map(column => (
                <td key={column}>{record[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default Radium(CrossTabChart);
