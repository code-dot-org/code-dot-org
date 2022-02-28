import PropTypes from 'prop-types';
import React from 'react';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import {assignmentCourseVersionShape} from './shapes';
import i18n from '@cdo/locale';
import FontAwesome from './../FontAwesome';
import color from '../../util/color';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';

export default function NewAssignmentVersionMenuItem(props) {
  // Returns whether we should display this version as english-only.
  const englishOnly = () => {
    const locales = props.courseVersion.locales;
    return (
      locales.length === 0 || (locales.length === 1 && locales[0] === 'English')
    );
  };

  const {courseVersion, onClick} = props;
  const tooltipId = _.uniqueId();

  return (
    <PopUpMenu.Item onClick={onClick}>
      <div style={style.wrapper}>
        <span style={style.selectedColumn}>
          {courseVersion.id === props.selectedCourseVersion.id && (
            <FontAwesome icon="check" />
          )}
        </span>
        <span
          style={style.titleColumn}
          className="assignment-courseVersion-title"
        >
          {courseVersion.display_name}
        </span>
        <span style={style.statusColumn}>
          {courseVersion.is_recommended && (
            <span style={style.recommended}>{i18n.recommended()}</span>
          )}
          {!courseVersion.is_stable && (
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
          {englishOnly() && i18n.englishOnly()}
          {!englishOnly() && (
            <div>
              <span data-tip data-for={tooltipId}>
                {i18n.numLanguages({
                  numLanguages: courseVersion.locales.length
                })}
                &nbsp;
                <FontAwesome icon="info-circle" style={style.infoCircle} />
              </span>
              <ReactTooltip id={tooltipId} place="right">
                {courseVersion.locales.join(', ')}
              </ReactTooltip>
            </div>
          )}
        </span>
      </div>
    </PopUpMenu.Item>
  );
}

NewAssignmentVersionMenuItem.propTypes = {
  selectedCourseVersion: PropTypes.object,
  courseVersion: assignmentCourseVersionShape,
  onClick: PropTypes.func.isRequired
};

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
