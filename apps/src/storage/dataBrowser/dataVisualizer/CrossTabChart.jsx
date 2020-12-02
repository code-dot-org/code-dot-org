import PropTypes from 'prop-types';
import React from 'react';
import {CROSS_TAB_CHART_AREA} from './constants';
import * as color from '../../../util/color';

export default function CrossTabChart(props) {
  if (!props.records || !props.selectedColumn1 || !props.selectedColumn2) {
    return null;
  }
  const {chartData, columns} = createPivotTable(
    props.records,
    props.numericColumns,
    props.selectedColumn1,
    props.selectedColumn2
  );
  const numericValues = [];

  chartData.forEach(record => {
    Object.entries(record).forEach(entry => {
      let key = entry[0];
      let value = entry[1];
      if (typeof value === 'number' && key !== props.selectedColumn1) {
        numericValues.push(value);
      }
    });
  });

  // Our goal is uniform column widths, for all columns except the first one.
  // There are a few steps that lead to successful layout here.
  // 1. The table width is 100% to maximize available space.
  // 2. The first column uses `white-space: nowrap` so it won't shrink too
  //    small for its contents.
  // 3. We set the rest of the columns to have the same percentage-width,
  //    adding up to 99% of the table width (which is more than available space)
  //    so after setting the first column width, the remaining columns
  //    shrink to fit evenly.
  const columnWidth = 99 / (columns.length - 1) + '%';

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  return (
    <div id={CROSS_TAB_CHART_AREA} style={wrapperStyle}>
      <h1 style={chartTitleStyle}>{props.chartTitle}</h1>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td>&nbsp;</td>
            <td
              style={{...topCellStyle, ...axisTitleStyle}}
              colSpan={columns.length - 1}
            >
              {props.selectedColumn2}
            </td>
          </tr>
          <tr>
            {columns.map((column, i) => (
              <td
                key={column}
                style={
                  i === 0 ? {...leftCellStyle, ...axisTitleStyle} : topCellStyle
                }
              >
                {column}
              </td>
            ))}
          </tr>
          {chartData.map(record => (
            <tr key={record[props.selectedColumn1]}>
              {columns.map((column, j) => {
                const value = record[column];
                const cellStyle =
                  j === 0
                    ? {...leftCellStyle}
                    : {
                        ...innerCellStyle,
                        width: columnWidth,
                        backgroundColor: getColorForValue(value, min, max)
                      };
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
    </div>
  );
}

CrossTabChart.propTypes = {
  records: PropTypes.array.isRequired,
  numericColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  chartTitle: PropTypes.string,
  selectedColumn1: PropTypes.string,
  selectedColumn2: PropTypes.string
};

/**
 * @param {Array.<Object>} records
 * @param {Array.<string>} numericColumns
 * @param {string} rowName
 * @param {string} columnName
 */
export function createPivotTable(records, numericColumns, rowName, columnName) {
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
  if (numericColumns.includes(columnName)) {
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
}

export function getColorForValue(value, min, max) {
  if (typeof value !== 'number') {
    return 'white';
  }
  const lightest = 100;
  const darkest = 56;
  const lightness =
    lightest - ((value - min) / (max - min)) * (lightest - darkest);
  return `hsl(217, 89%, ${lightness}%)`;
}

const wrapperStyle = {
  width: '100%'
};
const chartTitleStyle = {
  fontFamily: '"Gotham 7r", sans-serif',
  fontSize: 16,
  lineHeight: '16px',
  color: 'black'
};
const tableStyle = {
  width: '100%'
};
const cellStyle = {
  height: '2em',
  border: '1px solid black',
  textAlign: 'center'
};
const topCellStyle = {
  ...cellStyle,
  backgroundColor: color.lightest_gray,
  color: 'black'
};
const leftCellStyle = {
  ...cellStyle,
  backgroundColor: color.dark_charcoal,
  color: 'white',
  padding: '0 1em',
  whiteSpace: 'nowrap'
};
const innerCellStyle = {
  ...cellStyle,
  overflow: 'hidden'
};
const axisTitleStyle = {
  fontFamily: '"Gotham 5r", sans-serif'
};
