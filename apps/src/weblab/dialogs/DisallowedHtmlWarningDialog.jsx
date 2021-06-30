import React from 'react';
import PropTypes from 'prop-types';
import commonI18n from '@cdo/locale';
import weblabI18n from '@cdo/weblab/locale';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SupportArticleMarkdown from '@cdo/apps/weblab/SupportArticleMarkdown';

export default function DisallowedHtmlWarningDialog(props) {
  const body = (
    <div>
      <SafeMarkdown
        markdown={weblabI18n.disallowedHtml({
          filename: props.filename,
          disallowedTags: props.disallowedTags.join(', ')
        })}
      />
      <SupportArticleMarkdown />
    </div>
  );

  return (
    <StylizedBaseDialog
      isOpen={props.isOpen}
      title={commonI18n.warning()}
      body={body}
      handleClose={props.handleClose}
      renderFooter={() => (
        <FooterButton
          type="confirm"
          text={commonI18n.dialogOK()}
          onClick={props.handleClose}
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
