/**
 * @file Styles shared by various react components in the applab data browser.
 */

import color from '../../color';

const rowHeight = 45;
const cellPadding = 10;
const addButtonCellWidth = 92;
const editButtonCellWidth = 142;

export const row = {
  height: rowHeight,
};

export const cell = {
  padding: cellPadding,
  border: '1px solid gray',
  fontSize: 14,
  maxWidth: 350,
  overflow: 'hidden',
};

export const addButtonCell = {
  ...cell,
  minWidth: addButtonCellWidth,
  backgroundColor: color.lightest_teal,
  width: addButtonCellWidth,
};

export const editButtonCell = {
  ...cell,
  minWidth: editButtonCellWidth,
  backgroundColor: color.lightest_teal,
  width: editButtonCellWidth,
};

export const headerCell = {
  padding: '6px 10px',
  border: '1px solid gray',
  backgroundColor: color.teal
};

export const link = {
  color: color.purple,
  cursor: 'pointer',
  fontFamily: "'Gotham 7r', sans-serif",
};

export const button = {
  display: 'inline-block',
  fontSize: 14,
  lineHeight: '20px',
  marginTop: 0,
  marginLeft: 0,
  marginBottom: 0,
  marginRight: 0,
  padding: '4px 12px',
  textAlign: 'center',
  verticalAlign: 'middle',
};

export const whiteButton = {
  ...button,
  backgroundColor: 'white',
  color: 'black',
};

export const redButton = {
  ...button,
  backgroundColor: color.bootstrap_button_red,
  color: 'white',
};

export const blueButton = {
  ...button,
  backgroundColor: color.bootstrap_button_blue,
  color: 'white',
};

export const editButton = {
  ...whiteButton,
  marginRight: 10,
  width: 60
};

export const saveButton = {
  ...blueButton,
  marginRight: 10,
  width: 60
};

export const input = {
  width: 'calc(100% - 14px)',
  height: 20,
  border: '1px solid gray',
  borderRadius: 5,
  padding: '4px 6px'
};

export const viewHeader = {
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 0,
  marginRight: 0,
};

export const backLink = {
  fontSize: 24,
};

export const debugLink = {
  float: 'right',
};

export const debugData = {
  backgroundColor: color.lightest_gray,
  borderRadius: 10,
  border: `1px solid ${color.light_gray}`,
  flexGrow: 1,
  fontFamily: 'monospace',
  overflow: 'scroll',
  padding: 10,
  whiteSpace: 'pre-wrap',
};

export const clearfix = {
  content: '',
  display: 'inline-block',
  width: '100%',
  height: 0,
  fontSize: 0,
  lineHeight: 0,
};
