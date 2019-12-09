import PropTypes from 'prop-types';
import React from 'react';

const styles = {
  headerCell: {
    border: '1px solid black'
  },
  cell: {
    height: '2em',
    textAlign: 'center',
    border: '1px solid black'
  }
};

class CrossTabChart extends React.Component {
  static propTypes = {
    records: PropTypes.array.isRequired,
    numericColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    chartTitle: PropTypes.string,
    selectedColumn1: PropTypes.string,
    selectedColumn2: PropTypes.string
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

  getColorForValue = (value, min, max) => {
    if (typeof value === 'string') {
      return 'white';
    }
    const lightest = 100;
    const darkest = 56;
    const lightness =
      lightest - ((value - min) / (max - min)) * (lightest - darkest);
    return `hsl(217, 89%, ${lightness}%)`;
  };

  render() {
    if (
      !this.props.records ||
      !this.props.selectedColumn1 ||
      !this.props.selectedColumn2
    ) {
      return null;
    }
    const {chartData, columns} = this.createPivotTable(
      this.props.records,
      this.props.selectedColumn1,
      this.props.selectedColumn2
    );

    const numericValues = chartData
      .map(record =>
        Object.values(record).filter(value => typeof value === 'number')
      )
      .flat();

    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);

    return (
      <table>
        <tbody>
          <tr>
            {columns.map(column => (
              <th key={column} style={styles.headerCell}>
                {column}
              </th>
            ))}
          </tr>
          {chartData.map((record, id) => (
            <tr key={id}>
              {columns.map(column => {
                const value = record[column];
                const color = this.getColorForValue(value, min, max);
                const cellStyle = {...styles.cell, backgroundColor: color};
                return (
                  <td key={column} style={cellStyle}>
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default CrossTabChart;
