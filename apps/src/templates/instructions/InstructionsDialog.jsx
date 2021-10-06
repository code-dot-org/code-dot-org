import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import DialogInstructions from '@cdo/apps/templates/instructions/DialogInstructions';
import {closeDialog} from '@cdo/apps/redux/instructionsDialog';

export function InstructionsDialog(props) {
  return (
    <StylizedBaseDialog
      isOpen={props.isOpen}
      title={<h1 style={styles.title}>{props.title}</h1>}
      body={<DialogInstructions />}
      renderFooter={() => (
        <FooterButton
          type="confirm"
          text={i18n.dialogOK()}
          onClick={props.handleClose}
        />
      )}
      handleClose={props.handleClose}
      type="simple"
    />
  );
}

InstructionsDialog.propTypes = {
  title: PropTypes.string.isRequired,

  // Provided by Redux.
  isOpen: PropTypes.bool,
  handleClose: PropTypes.func.isRequired
};

export default connect(
  state => ({
    isOpen: state.instructionsDialog.open
  }),
  dispatch => ({
    handleClose: () => dispatch(closeDialog())
  })
)(InstructionsDialog);

const styles = {
  title: {
    fontSize: 24
  }
};
