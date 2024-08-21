import React, {Component} from 'react';

import i18n from '@cdo/locale';

import PopUpMenu from '../../sharedComponents/PopUpMenu';
import color from '../../util/color';

import {columnWidths, rowHeight, cellStyle} from './AssignmentVersionMenuItem';

const style = {
  item: {
    backgroundColor: color.charcoal,
    ':hover': {
      backgroundColor: color.charcoal,
    },
    cursor: 'default',
  },
  wrapper: {
    fontSize: 16,
    fontWeight: 'bold',
    height: rowHeight,
    color: color.white,
    display: 'flex',
    alignItems: 'center',
  },
  selectedColumn: {
    ...cellStyle,
    width: columnWidths.selected,
    marginLeft: -10,
  },
  titleColumn: {
    ...cellStyle,
    width: columnWidths.title,
  },
  statusColumn: {
    ...cellStyle,
    width: columnWidths.status,
  },
  languageColumn: {
    ...cellStyle,
    width: columnWidths.language,
    marginRight: -10,
  },
};

export default class AssignmentVersionMenuHeader extends Component {
  render() {
    return (
      <PopUpMenu.Item onClick={() => {}} style={style.item}>
        <div style={style.wrapper}>
          <span style={style.selectedColumn} />
          <span style={style.titleColumn}>{i18n.version()}</span>
          <span style={style.statusColumn} />
          <span style={style.languageColumn}>{i18n.languages()}</span>
        </div>
      </PopUpMenu.Item>
    );
  }
}
