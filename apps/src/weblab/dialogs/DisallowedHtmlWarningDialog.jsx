import React from 'react';
import PropTypes from 'prop-types';
import commonI18n from '@cdo/locale';
import weblabI18n from '@cdo/weblab/locale';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SupportArticleMarkdown from '@cdo/apps/weblab/SupportArticleMarkdown';

export default function DisallowedHtmlWarningDialog({
  isOpen,
  filename,
  disallowedTags,
  handleClose,
  ...props
}) {
  const body = (
    <div>
      <SafeMarkdown
        markdown={weblabI18n.disallowedHtml({
          filename,
          disallowedTags: disallowedTags.join(', ')
        })}
      />
      <SupportArticleMarkdown />
    </div>
  );

  return (
    <StylizedBaseDialog
      {...props}
      isOpen={isOpen}
      title={commonI18n.warning()}
      body={body}
      handleClose={handleClose}
      renderFooter={() => (
        <FooterButton
          type="confirm"
          text={commonI18n.dialogOK()}
          onClick={handleClose}
        />
      )}
    />
  );
}

DisallowedHtmlWarningDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  filename: PropTypes.string.isRequired,
  disallowedTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleClose: PropTypes.func.isRequired
};
