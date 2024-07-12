import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';
import i18n from '@cdo/javalab/locale';

import {fileShape} from './CommitDialogBody';

const PADDING = 8;

export default function CommitDialogFileRow({file, onToggleFile}) {
  return (
    <div style={styles.fileRow}>
      <div style={styles.fileLabelContainer}>
        <label htmlFor={`commit-${file.name}`} style={styles.fileLabel}>
          {file.name}
        </label>
        {file.hasConflictingName && (
          <div style={styles.fileNameConflictWarning}>
            {i18n.backpackFileNameConflictWarning()}
          </div>
        )}
      </div>
      <input
        id={`commit-${file.name}`}
        type="checkbox"
        checked={file.commit}
        onChange={() => onToggleFile(file.name)}
        style={styles.checkbox}
      />
    </div>
  );
}

CommitDialogFileRow.propTypes = {
  file: PropTypes.shape(fileShape).isRequired,
  onToggleFile: PropTypes.func.isRequired,
};

const styles = {
  fileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: PADDING,
    paddingBottom: PADDING / 2,
    borderBottom: `1px solid ${color.lightest_gray}`,
  },
  fileLabelContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  fileLabel: {
    flexGrow: 2,
    color: color.default_text,
  },
  fileNameConflictWarning: {
    color: color.default_text,
    fontStyle: 'italic',
    fontSize: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
  },
};
