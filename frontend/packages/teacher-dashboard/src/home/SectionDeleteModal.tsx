import Modal from '@code-dot-org/component-library/modal';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

export interface SectionDeleteModalProps {
  onCloseCallback: () => void;
  sectionDeleteCallback: () => void;
}

export const SectionDeleteModal: React.FC<SectionDeleteModalProps> = ({
  onCloseCallback,
  sectionDeleteCallback,
}) => {
  return (
    <Modal
      className={styles.deleteModal}
      title={i18n.deleteSection()}
      description={i18n.deleteSectionConfirm()}
      onClose={onCloseCallback}
      primaryButtonProps={{
        id: 'ui-test-delete-section-confirm',
        children: i18n.delete(),
        'aria-label': i18n.delete(),
        onClick: sectionDeleteCallback,
      }}
      secondaryButtonProps={{
        id: 'ui-test-delete-section-cancel',
        children: i18n.dialogCancel(),
        'aria-label': i18n.dialogCancel(),
        onClick: onCloseCallback,
      }}
    />
  );
};
