import React, { Component, PropTypes } from 'react';
import PopUpMenu from "../../lib/ui/PopUpMenu";
import {assignmentVersionShape} from './shapes';
import i18n from '@cdo/locale';
import FontAwesome from './../FontAwesome';
import color from "../../util/color";

export const columnWidths = {
  selected: 25,
  title: 60,
  status: 150,
};

export const rowHeight = 40;

const cellStyle = {
  display: 'inline-block',
  marginTop: 11,
};

const style = {
  wrapper: {
    fontSize: 16,
    height: rowHeight,
  },
  selectedColumn: {
    ...cellStyle,
    width: columnWidths.selected,
    marginLeft: -10,
  },
  titleColumn: {
    ...cellStyle,
    width: columnWidths.title,
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'bold',
    color: color.cyan,
  },
  statusColumn: {
    ...cellStyle,
    width: columnWidths.status,
    marginRight: -10,
  },
  recommended: {
    borderRadius: 5,
    padding: 8,
    backgroundColor: color.cyan,
    color: 'white',
  }
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
            {version.isRecommended && (
              <span style={style.recommended}>
                {i18n.recommended()}
              </span>
            )}
            {!version.isStable && (
              <span>
                <FontAwesome
                  icon="exclamation-triangle"
                  style={{color: color.light_orange}}
                />
                &nbsp;
                {i18n.inDevelopment()}
              </span>
            )}
          </span>
        </div>
      </PopUpMenu.Item>
    );
  }
}
