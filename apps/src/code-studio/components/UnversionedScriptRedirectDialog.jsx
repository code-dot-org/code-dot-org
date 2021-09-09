import React, {useState} from 'react';
import i18n from '@cdo/locale';
import StylizedBaseDialog, {
  FooterButton
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';

export default function UnversionedScriptRedirectDialog(props) {
  const [isOpen, setIsOpen] = useState(true);
  return (
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
  );
}
