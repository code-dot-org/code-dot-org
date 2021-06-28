import React from 'react';
import PropTypes from 'prop-types';
import commonI18n from '@cdo/locale';
import weblabI18n from '@cdo/weblab/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import {SUPPORT_ARTICLE_URL} from '@cdo/apps/weblab/constants';
import {reload} from '@cdo/apps/utils';

export default function FatalErrorDialog(props) {
  const body = (
    <div>
      <p>{props.errorMessage}</p>
      <SafeMarkdown
        markdown={weblabI18n.troubleshootingSupport({url: SUPPORT_ARTICLE_URL})}
        openExternalLinksInNewTab
      />
    </div>
  );

  const footerButtons = [
    <FooterButton
      text={commonI18n.tryAgain()}
      onClick={reload}
      key="cancel"
      type="cancel"
    />,
    <FooterButton
      text={weblabI18n.reset()}
      onClick={props.handleResetProject}
      key="reset"
      color="red"
    />,
    <FooterButton
      text={commonI18n.dismiss()}
      onClick={props.handleClose}
      key="confirm"
      type="confirm"
    />
  ];

  return (
    <StylizedBaseDialog
      title={commonI18n.errorOccurredTitle()}
      body={body}
      handleConfirmation={props.handleClose}
      renderFooter={() => footerButtons}
      {...props}
    />
  );
}

FatalErrorDialog.propTypes = {
  errorMessage: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleResetProject: PropTypes.func.isRequired
};
