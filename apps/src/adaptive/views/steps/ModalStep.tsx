// A step shown as a dialog over the page, the kind the Hour of AI finish
// uses: a heading, an image, a few lines, an outside link and the button on.

import Modal from '@code-dot-org/component-library/modal';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {ModalStep as ModalStepContent} from '../../types';

import styles from './stepPlayer.module.scss';

interface ModalStepProps {
  step: ModalStepContent;
  continueLabel: string;
  onComplete: () => void;
}

const ModalStep: React.FunctionComponent<ModalStepProps> = ({
  step,
  continueLabel,
  onComplete,
}) => (
  <Modal
    title={step.heading}
    customContent={
      <div className={styles.modalBody}>
        {step.imageUrl && (
          <img className={styles.modalImage} src={step.imageUrl} alt="" />
        )}
        <SafeMarkdown markdown={step.markdown} />
      </div>
    }
    primaryButtonProps={{
      children: step.continueLabel ?? continueLabel,
      onClick: onComplete,
    }}
    secondaryButtonProps={
      step.link && {
        children: step.link.label,
        href: step.link.href,
        target: '_blank',
        rel: 'noopener',
        color: 'tertiary',
        variant: 'outlined',
      }
    }
  />
);

export default ModalStep;
