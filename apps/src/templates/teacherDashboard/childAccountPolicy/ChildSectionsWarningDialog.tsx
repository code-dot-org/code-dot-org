import React, {CSSProperties} from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import i18n from '@cdo/locale';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChildSectionsWarningDialog: React.FC<Props> = ({
  onClose,
  isOpen,
}) => {
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const getDialogBody = () => {
    return (
      <div id="child-sections-warning-dialog">
        <h3>{i18n.childAccountPolicy_sectionsWarning_dialogTitle()}</h3>
        <SafeMarkdown
          markdown={i18n.childAccountPolicy_sectionsWarning_dialogBody()}
        />
        <br />
        <SafeMarkdown
          markdown={i18n.childAccountPolicy_sectionsWarning_dialogMoreInfo({
            parentalConsentLink:
              'https://support.code.org/hc/en-us/articles/15465423491085-How-do-I-obtain-parent-or-guardian-permission-for-student-accounts',
          })}
        />

        <DialogFooter rightAlign={true}>
          <Button
            text={i18n.closeDialog()}
            onClick={handleClose}
            color={Button.ButtonColor.brandSecondaryDefault}
          />
        </DialogFooter>
      </div>
    );
  };

  return (
    <BaseDialog
      useUpdatedStyles
      isOpen={isOpen}
      handleClose={handleClose}
      style={styles.dialog}
    >
      {getDialogBody()}
    </BaseDialog>
  );
};

const styles: {[styleKey: string]: CSSProperties} = {
  dialog: {
    padding: 20,
  },
  spinnerContainer: {
    textAlign: 'center',
  },
  spinner: {
    fontSize: '32px',
  },
};

export default ChildSectionsWarningDialog;
