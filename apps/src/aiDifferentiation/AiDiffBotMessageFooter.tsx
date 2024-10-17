import React from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {commonI18n} from '@cdo/apps/types/locale';

import {ChatTextMessage} from './types';

import style from './ai-differentiation.module.scss';

interface Props {
  message: ChatTextMessage;
}

const AiDiffBotMessageFooter: React.FC<Props> = ({message}) => {
  return (
    <div className={style.messageFeedbackContainer}>
      <div className={style.messageFeedbackLeft}>
        <Button
          onClick={() => {}}
          color="white"
          size="xs"
          isIconOnly
          icon={{iconStyle: 'regular', iconName: 'copy'}}
          type="primary"
          className={style.messageFeedbackButton}
        />
        <Button
          onClick={() => {}}
          color="white"
          size="xs"
          isIconOnly
          icon={{iconStyle: 'regular', iconName: 'file-export'}}
          type="primary"
          className={style.messageFeedbackButton}
        />
      </div>
      <div className={style.messageFeedbackRight}>
        {commonI18n.aiFeedbackQuestion()}
        <Button
          onClick={() => {}}
          color="white"
          size="xs"
          isIconOnly
          icon={{iconStyle: 'regular', iconName: 'thumbs-up'}}
          type="primary"
          className={style.messageFeedbackButton}
        />
        <Button
          onClick={() => {}}
          color="white"
          size="xs"
          isIconOnly
          icon={{iconStyle: 'regular', iconName: 'thumbs-down'}}
          type="primary"
          className={style.messageFeedbackButton}
        />
        <Button
          onClick={() => {}}
          color="white"
          size="xs"
          isIconOnly
          icon={{iconStyle: 'regular', iconName: 'flag-pennant'}}
          type="primary"
          className={style.messageFeedbackButton}
        />
      </div>
    </div>
  );
};

export default AiDiffBotMessageFooter;
