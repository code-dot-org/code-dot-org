import React, { Component, PropTypes } from 'react';
import PopUpMenu from "../../lib/ui/PopUpMenu";
import {assignmentVersionShape} from './shapes';
import i18n from '@cdo/locale';
import FontAwesome from './../FontAwesome';

export const columnWidths = {
  selected: 25,
  title: 60,
  status: 100
};

const style = {
  wrapper: {
    fontSize: 16,
  },
  selectedColumn: {
    width: columnWidths.selected,
    display: 'inline-block',
    marginLeft: -10,
  },
  titleColumn: {
    width: columnWidths.title,
    display: 'inline-block',
  },
  statusColumn: {
    width: columnWidths.status,
    display: 'inline-block',
    marginRight: -10,
  },
};

export default class AssignmentVersionMenuItem extends Component {
  static propTypes = {
    version: assignmentVersionShape,
    onClick: PropTypes.func.isRequired,
  };

  render() {
    const {version, onClick} = this.props;
    return (
      <PopUpMenu.Item onClick={onClick}>
        <div style={style.wrapper}>
          <span style={style.selectedColumn}>
            {version.isSelected && <FontAwesome icon="check"/>}
          </span>
            <span style={style.titleColumn}>
            {version.title}
          </span>
            <span style={style.statusColumn}>
            {version.isRecommended && i18n.recommended()}
          </span>
        </div>
      </PopUpMenu.Item>
    );
  }
}
