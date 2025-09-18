import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {FC} from 'react';

import aiBotLockedIcon from '@cdo/static/aichat/ai-bot-locked-icon.png';

import styles from './chatWorkspace.module.scss';

export const ChatDisabled: FC<{text: string}> = ({text}) => {
  return (
    <div className={styles.chatDisabledContainer}>
      <img src={aiBotLockedIcon} alt="" className={styles.chatDisabledIcon} />
      <BodyThreeText>{text}</BodyThreeText>
    </div>
  );
};
