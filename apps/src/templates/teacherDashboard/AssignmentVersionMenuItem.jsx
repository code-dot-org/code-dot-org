import PropTypes from 'prop-types';
import React, {Component} from 'react';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import {assignmentVersionShape} from './shapes';
import i18n from '@cdo/locale';
import FontAwesome from './../FontAwesome';
import color from '../../util/color';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';

export const columnWidths = {
  selected: 25,
  title: 70,
  status: 160,
  language: 140
};

export const rowHeight = 35;

export const cellStyle = {
  display: 'inline-block',
  marginTop: 9
};

const style = {
  wrapper: {
    fontSize: 16,
    height: rowHeight
  },
  selectedColumn: {
    ...cellStyle,
    width: columnWidths.selected,
    marginLeft: -10
  },
  titleColumn: {
    ...cellStyle,
    width: columnWidths.title,
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'bold'
  },
  statusColumn: {
    ...cellStyle,
    width: columnWidths.status
  },
  recommended: {
    borderRadius: 5,
    padding: 8,
    backgroundColor: color.cyan,
    color: 'white'
  },
  languageColumn: {
    ...cellStyle,
    width: columnWidths.language,
    marginRight: -10
  },
  infoCircle: {
    fontSize: 18
  }
};

export default class AssignmentVersionMenuItem extends Component {
  static propTypes = {
    version: assignmentVersionShape,
    onClick: PropTypes.func.isRequired
  };

  // Returns whether we should display this version as english-only.
  englishOnly() {
    const locales = this.props.version.locales;
    return (
      locales.length === 0 || (locales.length === 1 && locales[0] === 'English')
    );
  }

  render() {
    const {version, onClick} = this.props;
    const tooltipId = _.uniqueId();
    return (
      <PopUpMenu.Item onClick={onClick}>
        <div style={style.wrapper}>
          <span style={style.selectedColumn}>
            {version.isSelected && <FontAwesome icon="check" />}
          </span>
          <span style={style.titleColumn} className="assignment-version-title">
            {version.title}
          </span>
          <span style={style.statusColumn}>
            {version.isRecommended && (
              <span style={style.recommended}>{i18n.recommended()}</span>
            )}
            {!version.isStable && (
              <span>
                <FontAwesome
                  icon="exclamation-triangle"
                  style={{color: color.light_orange}}
                />
                &nbsp;
                {i18n.preview()}
              </span>
            )}
          </span>
          <span style={style.languageColumn}>
            {this.englishOnly() && i18n.englishOnly()}
            {!this.englishOnly() && (
              <div>
                <span data-tip data-for={tooltipId}>
                  {i18n.numLanguages({numLanguages: version.locales.length})}
                  &nbsp;
                  <FontAwesome icon="info-circle" style={style.infoCircle} />
                </span>
                <ReactTooltip id={tooltipId} place="right">
                  {version.locales.join(', ')}
                </ReactTooltip>
              </div>
            )}
          </span>
        </div>
      </PopUpMenu.Item>
    );
  }
}
