/**
 * @file Styles shared by various react components in the applab data browser.
 */

import color from '../color';

const rowHeight = 45;
const cellPadding = 10;

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
  marginRight: 10
};

const input = {
  width: 'calc(100% - 14px)',
  height: 20,
  border: '1px solid gray',
  borderRadius: 5,
  padding: '4px 6px'
};

export default {
  editRow,
  addRow,
  cell,
  headerCell,
  link,
  button,
  editButton,
  input
};
