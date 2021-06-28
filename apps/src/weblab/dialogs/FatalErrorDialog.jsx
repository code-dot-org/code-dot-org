import React from 'react';
import PropTypes from 'prop-types';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import {reload} from '@cdo/apps/utils';

// TODO: i18n
export default function FatalErrorDialog(props) {
  const footerButtons = [
    <FooterButton
      text="Try Again"
      onClick={reload}
      key="cancel"
      type="cancel"
    />,
    <FooterButton
      text="Reset Web Lab"
      onClick={props.handleResetProject}
      key="reset"
      color="red"
    />,
    <FooterButton
      text="Dismiss"
      onClick={props.handleClose}
      key="confirm"
      type="confirm"
    />
  ];

  // TODO: append support article to props.body
  return (
    <StylizedBaseDialog
      title={props.title}
      body={props.body}
      handleConfirmation={props.handleClose}
      renderFooter={() => footerButtons}
      {...props}
    />
  );
}

FatalErrorDialog.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleResetProject: PropTypes.func.isRequired
};

FatalErrorDialog.defaultProps = {
  title: 'An Error Occurred'
};
