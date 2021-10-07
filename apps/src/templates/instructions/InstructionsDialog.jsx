import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import ExampleImage from '@cdo/apps/templates/instructions/ExampleImage';
import Instructions from '@cdo/apps/templates/instructions/Instructions';
import {closeDialog} from '@cdo/apps/redux/instructionsDialog';

export function InstructionsDialog(props) {
  function body() {
    if (props.imgOnly && props.imgUrl) {
      return <ExampleImage src={props.imgUrl} />;
    } else {
      return (
        <Instructions
          longInstructions={props.longInstructions || props.shortInstructions}
          imgURL={props.imgUrl}
          isBlockly={props.isBlockly}
        />
      );
    }
  }

  return (
    <StylizedBaseDialog
      isOpen={props.isOpen}
      title={<h1 style={styles.title}>{props.title}</h1>}
      body={body()}
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
  imgOnly: PropTypes.bool,
  imgUrl: PropTypes.string,
  longInstructions: PropTypes.string,
  shortInstructions: PropTypes.string,
  isBlockly: PropTypes.bool,
  handleClose: PropTypes.func.isRequired
};

export default connect(
  state => ({
    isOpen: state.instructionsDialog.open,
    imgOnly: state.instructionsDialog.imgOnly,
    imgUrl: state.instructionsDialog.imgUrl || state.pageConstants.aniGifURL,
    longInstructions: state.instructions.longInstructions,
    shortInstructions: state.instructions.shortInstructions,
    isBlockly: state.pageConstants.isBlockly
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
