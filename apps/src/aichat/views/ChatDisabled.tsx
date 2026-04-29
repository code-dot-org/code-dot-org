import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link, {LinkProps} from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import React, {FC} from 'react';

import styles from './chatWorkspace.module.scss';

export const ChatDisabled: FC<{message?: string; link?: LinkProps}> = ({
  message = 'AI chat is currently disabled',
  link,
}) => {
  return (
    <div className={styles.chatDisabledContainer}>
      <FontAwesomeV6Icon
        className={styles.chatDisabledIcon}
        iconName="ai-locked"
        iconFamily="kit"
      />
      <Typography variant="body3" gutterBottom>
        {message}
        {link && (
          <>
            {' '}
            <Link
              {...link}
              size={link.size ?? 's'}
              type={link.type ?? 'secondary'}
            />
          </>
        )}
      </Typography>
    </div>
  );
};
