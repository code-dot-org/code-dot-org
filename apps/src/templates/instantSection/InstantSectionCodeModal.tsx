import Modal from '@code-dot-org/component-library/modal';
import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './instant-section.module.scss';

export default function InstantSectionCodeModal({
  sectionCode,
  onClose,
}: {
  sectionCode: string;
  onClose: () => void;
}) {
  return (
    <Modal
      className={styles.codeModal}
      title={i18n.instantSectionTitle()}
      description={i18n.instantSectionDisplayInstructions()}
      closeLabel={i18n.closeDialog()}
      onClose={onClose}
      primaryButtonProps={{children: i18n.done(), onClick: onClose}}
      customContent={
        <div className={styles.codeDisplay}>
          <Typography component="p" className={styles.joinAddress}>
            code.org/join
          </Typography>
          <Typography
            component="p"
            className={styles.sectionCode}
            aria-label={sectionCode.split('').join(' ')}
          >
            {sectionCode}
          </Typography>
        </div>
      }
    />
  );
}
