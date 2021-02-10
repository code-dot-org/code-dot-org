import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  container: {
    padding: '10px 30px'
  },
  buttonContainer: {
    display: 'flex'
  },
  volumeIcon: {
    fontSize: '75px'
  }
};

const ReadInstructionsDialog = () => {
  return (
    <BaseDialog isOpen={true}>
      <div style={styles.container}>
        <h2>Are you ready to continue?</h2>
        <div style={styles.buttonContainer}>
          <button type="button">
            <FontAwesome style={styles.volumeIcon} icon="volume-off" />
            <h3>Do not read instructions</h3>
          </button>
          <button type="button">
            <FontAwesome style={styles.volumeIcon} icon="volume-up" />
            <h3>Read instructions to me</h3>
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default ReadInstructionsDialog;

ReadInstructionsDialog.propTypes = {};
