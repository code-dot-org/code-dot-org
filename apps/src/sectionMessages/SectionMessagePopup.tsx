import Dialog from '@code-dot-org/component-library/dialog';
import React from 'react';

import styles from './section-message-popup.module.scss';

export interface SectionMessageData {
  section_id: number;
  section_name?: string;
  teacher_name?: string;
  message: string;
  link?: string | null;
  sent_at?: string;
}

interface SectionMessagePopupProps {
  data: SectionMessageData;
  onClose: () => void;
}

const SectionMessagePopup: React.FC<SectionMessagePopupProps> = ({
  data,
  onClose,
}) => {
  const title = data.teacher_name
    ? `Message from ${data.teacher_name}`
    : 'Message from your teacher';

  const handleOpenLink = () => {
    if (data.link) {
      // noopener/noreferrer keeps the new tab from getting a back-reference
      // to this window.
      window.open(data.link, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  const body = (
    <div className={styles.body}>
      <div className={styles.message}>{data.message}</div>
      {data.link && (
        <div className={styles.linkBox}>
          <span className={styles.linkCaption}>Link</span>
          <a
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkUrl}
          >
            {data.link}
          </a>
        </div>
      )}
    </div>
  );

  if (data.link) {
    return (
      <Dialog
        title={title}
        customContent={body}
        primaryButtonProps={{
          children: 'Open link',
          onClick: handleOpenLink,
        }}
        secondaryButtonProps={{
          children: 'Dismiss',
          onClick: onClose,
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <Dialog
      title={title}
      customContent={body}
      primaryButtonProps={{children: 'OK', onClick: onClose}}
      onClose={onClose}
    />
  );
};

export default SectionMessagePopup;
