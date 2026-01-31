import type {FunctionComponent} from 'react';
import {useMemo, useState} from 'react';

import type {Theme} from '@code-dot-org/component-library/common/contexts';
import Modal from '@code-dot-org/component-library/modal';

import ButtonWithDialog from './ButtonWithDialog';

import moduleStyles from './disclaimer.module.scss';

const LEARN_MORE_URL =
  'https://support.code.org/hc/en-us/articles/40542019587213-AI-Tutor-FAQ';

interface DisclaimerProps {
  theme: Theme;
}

const DisclaimerButton: FunctionComponent<DisclaimerProps> = ({theme}) => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const innerDialog = useMemo(
    () =>
      isDisclaimerOpen ? (
        <Modal
          title="Using AI Tutor"
          description="Our new AI Tutor can help you think through new ideas, debug your code, and learn along the way! You can ask it questions about your project or the concepts you’re exploring.\n\nJust remember, AI isn’t human and not perfect. Sometimes it might make mistakes or give answers that don’t quite make sense. Always make sure to use your own judgment, double-check any AI advice, and don’t be afraid to experiment."
          className={moduleStyles.respectNewLines}
          primaryButtonProps={{
            text: 'Back to project',
            onClick: () => setIsDisclaimerOpen(false),
          }}
          secondaryButtonProps={{
            text: 'Learn more',
            useAsLink: true,
            href: LEARN_MORE_URL,
            target: '_blank',
          }}
          onClose={() => setIsDisclaimerOpen(false)}
        />
      ) : null,
    [isDisclaimerOpen],
  );

  return (
    <ButtonWithDialog
      text="AI can make mistakes. Click to learn more."
      id={'disclaimer'}
      theme={theme}
      Dialog={innerDialog}
      iconName={'shield-exclamation'}
      setIsDialogOpen={setIsDisclaimerOpen}
      ariaLabel="AI can make mistakes. Click to learn more."
      buttonSize="s"
    />
  );
};

export default DisclaimerButton;
