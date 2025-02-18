import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {closeDialog} from '@cdo/apps/redux/instructionsDialog';
import StylizedBaseDialog, {
  FooterButton,
} from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import ExampleImage from '@cdo/apps/templates/instructions/ExampleImage';
import Instructions from '@cdo/apps/templates/instructions/Instructions';
import i18n from '@cdo/locale';

export function InstructionsDialog(props) {
  function body() {
    if (props.imgOnly && props.imgUrl) {
      return (
        <div style={styles.imgContainer}>
          <ExampleImage src={props.imgUrl} />
        </div>
      );
    }

    return (
      <Instructions
        instructions={props.instructions}
        imgURL={props.imgUrl}
        isBlockly={props.isBlockly}
        inTopPane={false}
      />
    );
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
  instructions: PropTypes.string,
  isBlockly: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    isOpen: state.instructionsDialog.open,
    imgOnly: state.instructionsDialog.imgOnly,
    imgUrl: state.instructionsDialog.imgUrl || state.pageConstants.aniGifURL,
    instructions:
      state.instructions.longInstructions ||
      state.instructions.shortInstructions,
    isBlockly: state.pageConstants.isBlockly,
  }),
  dispatch => ({
    handleClose: () => dispatch(closeDialog()),
  })
)(InstructionsDialog);

const styles = {
  title: {
    fontSize: 24,
  },
  imgContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
};
