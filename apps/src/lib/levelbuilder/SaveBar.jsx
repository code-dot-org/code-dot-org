import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import {navigateToHref} from '@cdo/apps/utils';

export default function SaveBar({
  error,
  handleSave,
  handleView,
  isSaving,
  lastSaved,
  pathForShowButton,
}) {
  const renderShowButtonOrPlaceholder = () => {
    const isShowButtonVisible = handleView || pathForShowButton;

    const renderShowButton = () => (
      <button
        className="btn"
        type="button"
        style={styles.saveButton}
        onClick={handleView || (() => navigateToHref(pathForShowButton))}
        disabled={isSaving}
      >
        Show
      </button>
    );

    return isShowButtonVisible ? renderShowButton() : <span />;
  };

  return (
    <div style={styles.saveButtonBackground} className="saveBar">
      {renderShowButtonOrPlaceholder()}
      <div style={styles.saveButtonArea}>
        {lastSaved && !error && (
          <div style={styles.lastSaved} className="lastSavedMessage">
            {`Last saved at: ${new Date(lastSaved).toLocaleString()}`}
          </div>
        )}
        {error && <div style={styles.error}>{`Error Saving: ${error}`}</div>}
        {isSaving && (
          <div style={styles.spinner}>
            <FontAwesome icon="spinner" className="fa-spin" />
          </div>
        )}
        <button
          className="btn"
          type="button"
          style={styles.saveButton}
          onClick={e => handleSave(e, false)}
          disabled={isSaving}
        >
          Save and Keep Editing
        </button>
        <button
          className="btn btn-primary"
          type="submit"
          style={styles.saveButton}
          onClick={e => handleSave(e, true)}
          disabled={isSaving}
        >
          Save and Close
        </button>
      </div>
    </div>
  );
}

SaveBar.propTypes = {
  error: PropTypes.string,
  handleSave: PropTypes.func.isRequired,
  handleView: PropTypes.func,
  isSaving: PropTypes.bool,
  lastSaved: PropTypes.number,
  pathForShowButton: PropTypes.string,
};

SaveBar.defaultProps = {
  isSaving: false,
  lastSaved: 0,
};

const styles = {
  saveButtonBackground: {
    margin: 0,
    position: 'fixed',
    bottom: 0,
    left: 0,
    backgroundColor: color.lightest_gray,
    borderColor: color.lightest_gray,
    height: 50,
    width: '100%',
    zIndex: 900,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButtonArea: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveButton: {
    margin: '10px 50px 10px 20px',
  },
  spinner: {
    fontSize: 25,
    padding: 10,
  },
  lastSaved: {
    fontSize: 14,
    color: color.level_perfect,
    padding: 15,
  },
  error: {
    fontSize: 14,
    color: color.red,
    padding: 15,
    maxWidth: 800,
  },
};
