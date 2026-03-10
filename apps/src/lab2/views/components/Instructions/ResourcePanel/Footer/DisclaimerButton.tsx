import {Theme} from '@code-dot-org/component-library/common/contexts';
import Modal from '@code-dot-org/component-library/modal';
import React, {useMemo, useState} from 'react';

import lab2I18n from '@cdo/apps/lab2/locale';

import ButtonWithDialog from './ButtonWithDialog';

import styles from './disclaimer.module.scss';

const LEARN_MORE_URL =
  'https://support.code.org/hc/en-us/articles/40542019587213-AI-Tutor-FAQ';

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
        <Modal
          title={lab2I18n.aiTutorDisclaimerTitle()}
          description={lab2I18n.aiTutorDisclaimerLong()}
          className={styles.respectNewLines}
          primaryButtonProps={{
            text: lab2I18n.backToProject(),
            onClick: () => setIsDisclaimerOpen(false),
          }}
          secondaryButtonProps={{
            text: lab2I18n.learnMore(),
            useAsLink: true,
            href: LEARN_MORE_URL,
            target: '_blank',
          }}
          onClose={() => setIsDisclaimerOpen(false)}
        />
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
      buttonSize="s"
    />
  );
};

export default DisclaimerButton;
