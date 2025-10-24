import {Theme} from '@code-dot-org/component-library/common/contexts';
import Modal from '@code-dot-org/component-library/modal';
import React, {useMemo, useState} from 'react';

import lab2I18n from '@cdo/apps/lab2/locale';

import ButtonWithDialog from './ButtonWithDialog';

import styles from './disclaimer.module.scss';

interface DisclaimerProps {
  theme: Theme;
}

const DisclaimerButton: React.FunctionComponent<DisclaimerProps> = ({
  theme,
}) => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const innerDialog = useMemo(
    () =>
      isDisclaimerOpen ? (
        <div data-theme={'Light'}>
          <Modal
            title={'Using AI Tutor'}
            description={lab2I18n.aiTutorDisclaimerLong()}
            className={styles.respectNewLines}
            primaryButtonProps={{
              text: 'Back to project',
              onClick: () => setIsDisclaimerOpen(false),
            }}
            secondaryButtonProps={{
              text: 'Learn more',
              onClick: () =>
                window.open(
                  'https://support.code.org/hc/en-us/articles/40542019587213/live_preview/01K86JQKCEP6HFD5CCWX0M1T05'
                ),
            }}
            onClose={() => setIsDisclaimerOpen(false)}
          />
        </div>
      ) : null,
    [isDisclaimerOpen]
  );

  return (
    <ButtonWithDialog
      text={lab2I18n.aiTutorDisclaimerShort()}
      id={'disclaimer'}
      theme={theme}
      Dialog={innerDialog}
      iconName={'shield-exclamation'}
      setIsDialogOpen={setIsDisclaimerOpen}
      ariaLabel={lab2I18n.aiTutorDisclaimerShort()}
    />
  );
};

export default DisclaimerButton;
