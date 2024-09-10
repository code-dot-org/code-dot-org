import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/javalab/locale';

import CommitDialogFileRow from './CommitDialogFileRow';

export const fileShape = {
  name: PropTypes.string.isRequired,
  commit: PropTypes.bool.isRequired,
  hasConflictingName: PropTypes.bool.isRequired,
};

const PADDING = 8;

export default function CommitDialogBody({
  files,
  notes,
  onToggleFile,
  onChangeNotes,
  showSaveToBackpackSection,
}) {
  const renderSaveToBackpackSection = () => (
    <>
      <div style={{...styles.bold, ...styles.filesHeader}}>
        {i18n.saveToBackpack()}
      </div>
      {files.map(file => {
        return (
          <CommitDialogFileRow
            file={file}
            onToggleFile={onToggleFile}
            key={file.name}
          />
        );
      })}
    </>
  );

  return (
    <div>
      <label htmlFor="commit-notes" style={{...styles.bold, ...styles.notes}}>
        {i18n.commitNotes()}
      </label>
      <textarea
        id="commit-notes"
        placeholder={i18n.commitNotesPlaceholder()}
        onChange={e => onChangeNotes(e.target.value)}
        style={styles.textarea}
        value={notes}
      />
      {showSaveToBackpackSection && renderSaveToBackpackSection()}
    </div>
  );
}

CommitDialogBody.propTypes = {
  files: PropTypes.arrayOf(PropTypes.shape(fileShape)).isRequired,
  notes: PropTypes.string,
  onToggleFile: PropTypes.func.isRequired,
  onChangeNotes: PropTypes.func.isRequired,
  showSaveToBackpackSection: PropTypes.bool,
};

const styles = {
  bold: {
    ...fontConstants['main-font-semi-bold'],
    color: color.dark_charcoal,
  },
  filesHeader: {
    fontSize: 14,
    backgroundColor: color.lightest_gray,
    padding: PADDING,
  },
  notes: {
    paddingTop: PADDING * 2,
  },
  textarea: {
    width: '98%',
    height: 75,
    resize: 'none',
  },
};
