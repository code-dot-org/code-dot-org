import PropTypes from 'prop-types';
import React from 'react';

import StylizedBaseDialog, {
  FooterButton,
} from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import {reload} from '@cdo/apps/utils';
import SupportArticleMarkdown from '@cdo/apps/weblab/SupportArticleMarkdown';
import commonI18n from '@cdo/locale';
import weblabI18n from '@cdo/weblab/locale';

export default function FatalErrorDialog({
  isOpen,
  errorMessage,
  handleClose,
  handleResetProject,
  ...props
}) {
  const body = (
    <div>
      <p>{errorMessage}</p>
      <SupportArticleMarkdown />
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
      onClick={handleResetProject}
      key="reset"
      color="red"
    />,
    <FooterButton
      text={commonI18n.dismiss()}
      onClick={handleClose}
      key="confirm"
      type="confirm"
    />,
  ];

  return (
    <StylizedBaseDialog
      {...props}
      isOpen={isOpen}
      title={commonI18n.errorOccurredTitle()}
      body={body}
      handleClose={handleClose}
      renderFooter={() => footerButtons}
    />
  );
}

FatalErrorDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleResetProject: PropTypes.func.isRequired,
};
