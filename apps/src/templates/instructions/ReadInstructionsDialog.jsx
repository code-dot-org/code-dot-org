import PropTypes from 'prop-types';
import React from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';

const styles = {
  container: {
    padding: '0 20px 30px 20px'
  },
  buttonContainer: {
    display: 'flex'
  },
  button: {
    height: '100%',
    fontSize: '14px',
    paddingBottom: '10px'
  },
  icon: {
    fontSize: '75px',
    display: 'block',
    marginBottom: '10px'
  }
};

// TODO: add text to internationalization

const ReadInstructionsDialog = ({
  isOpen,
  handleClose,
  handleReadInstructions
}) => {
  return (
    <BaseDialog isOpen={isOpen} handleClose={handleClose}>
      <div style={styles.container}>
        <h2>Are you ready to continue?</h2>
        <div style={styles.buttonContainer}>
          <Button
            icon="volume-off"
            color="gray"
            iconStyle={styles.icon}
            text="Do not read instructions"
            onClick={handleClose}
            style={{...styles.button, marginRight: '30px'}}
          />
          <Button
            icon="volume-up"
            iconStyle={styles.icon}
            text="Read instructions to me"
            onClick={handleReadInstructions}
            style={styles.button}
          />
        </div>
      </div>
    </BaseDialog>
  );
};

export default ReadInstructionsDialog;

ReadInstructionsDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleReadInstructions: PropTypes.func.isRequired
};
