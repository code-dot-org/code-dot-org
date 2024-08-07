import React, {useState} from 'react';

import StylizedBaseDialog, {
  FooterButton,
} from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import i18n from '@cdo/locale';

/*
 * Simple dialog to show a warning to users who are using deprecated unversioned
 * links to units with courses, such as /s/csd4 or /s/csp2. We plan on removing
 * these links in June 2022. See https://codedotorg.atlassian.net/browse/PLAT-1135.
 */
export default function UnversionedScriptRedirectDialog(props) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div id="ui-test-unversioned-script-redirect-dialog">
      <StylizedBaseDialog
        title={i18n.warning()}
        body={i18n.unversionedRedirectWarning_June2022()}
        renderFooter={() => (
          <FooterButton
            type="confirm"
            onClick={() => setIsOpen(false)}
            text={i18n.dialogOK()}
          />
        )}
        handleClose={() => setIsOpen(false)}
        isOpen={isOpen}
      />
    </div>
  );
}
