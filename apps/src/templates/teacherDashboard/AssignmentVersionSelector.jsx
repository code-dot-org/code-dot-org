import React, { Component, PropTypes } from 'react';
import i18n from '@cdo/locale';
import {assignmentVersionShape} from './shapes';

const styles = {
  version: {
    display: 'inline-block',
    marginTop: 4,
  },
  dropdownLabel: {
    fontFamily: '"Gotham 5r", sans-serif',
  },
};

export default class AssignmentVersionSelector extends Component {
  static propTypes = {
    dropdownStyle: PropTypes.object,
    onChangeVersion: PropTypes.func.isRequired,
    selectedVersion: assignmentVersionShape,
    versions: PropTypes.arrayOf(assignmentVersionShape),
    disabled: PropTypes.bool,
  };

  render() {
    const {dropdownStyle, onChangeVersion, selectedVersion, versions, disabled} = this.props;

    return (
      <span style={styles.version}>
        <div style={styles.dropdownLabel}>{i18n.assignmentSelectorVersion()}</div>
        <select
          id="assignment-version-year"
          value={selectedVersion.year}
          onChange={onChangeVersion}
          style={dropdownStyle}
          disabled={disabled}
        >
          {
            versions.map(version => (
              <option
                key={version.year}
                value={version.year}
              >
                {version.isRecommended ? `${version.title} (Recommended)` : version.title}
              </option>
            ))
          }
        </select>
      </span>
    );
  }

}


