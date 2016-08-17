/**
 * @file Styles shared by various react components in the applab data browser.
 */

import color from '../../color';

const rowHeight = 45;
const cellPadding = 10;
const buttonCellWidth = 142;

const editRow = {
  height: rowHeight
};

const addRow = {
  height: rowHeight,
  backgroundColor: color.lighter_purple
};

const cell = {
  padding: cellPadding,
  border: '1px solid gray',
  fontSize: 14
};

const buttonCell = [cell, {
  width: buttonCellWidth
}];

const headerCell = {
  padding: cellPadding,
  border: '1px solid gray',
  backgroundColor: color.teal
};

const link = {
  color: color.purple,
  fontFamily: "'Gotham 7r', sans-serif"
};

const button = {
  margin: 0
};

const editButton = {
  marginTop: 0,
  marginLeft: 0,
  marginBottom: 0,
  marginRight: 10,
  width: 60
};

const rightButton = {
  float: 'right',
  marginTop: 0,
  marginLeft: 10,
  marginBottom: 0,
  marginRight: 0,
};

const input = {
  width: 'calc(100% - 14px)',
  height: 20,
  border: '1px solid gray',
  borderRadius: 5,
  padding: '4px 6px'
};

const viewHeader = {
  marginTop: 10,
    marginBottom: 10,
    marginLeft: 0,
    marginRight: 0,
};

const backLink = {
  fontSize: 17.5,
};

const debugLink = {
  float: 'right',
};

const debugData = {
  backgroundColor: color.lightest_gray,
  borderRadius: 10,
  border: `1px solid ${color.light_gray}`,
  fontFamily: 'monospace',
  padding: 10,
  whiteSpace: 'pre-wrap',
};

export {
  editRow,
  addRow,
  cell,
  buttonCell,
  headerCell,
  link,
  button,
  editButton,
  rightButton,
  input,
  viewHeader,
  backLink,
  debugLink,
  debugData,
};
