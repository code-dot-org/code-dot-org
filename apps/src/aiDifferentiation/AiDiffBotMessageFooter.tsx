import {PDFDownloadLink} from '@react-pdf/renderer';
import React, {useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {commonI18n} from '@cdo/apps/types/locale';

import AiDiffPdf from './AiDiffPdf';
import {ChatTextMessage} from './types';

import style from './ai-differentiation.module.scss';

// Fallback method for browsers that do not support navigator.clipboard
const copyToClipboard = (text: string) => {
  const textField = document.createElement('textarea');
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
};

interface Props {
  message: ChatTextMessage;
}

const AiDiffBotMessageFooter: React.FC<Props> = ({message}) => {
  const CONFIRM_TIMEOUT_MS = 1500;
  const [copyTimeout, setCopyTimeout] = useState(false);
  const [pdfTimeout, setPdfTimeout] = useState(false);

  return (
    <div className={style.messageFeedbackContainer}>
      <div className={style.messageFeedbackLeft}>
        <Button
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(message.chatMessageText);
            } else {
              copyToClipboard(message.chatMessageText);
            }
            setCopyTimeout(true);
            setTimeout(() => setCopyTimeout(false), CONFIRM_TIMEOUT_MS);
          }}
          color="white"
          size="xs"
          isIconOnly
          icon={{
            iconStyle: 'regular',
            iconName: copyTimeout ? 'check' : 'copy',
          }}
          type="primary"
          className={
            copyTimeout
              ? style.messageFeedbackConfirm
              : style.messageFeedbackButton
          }
        />
        <PDFDownloadLink
          document={<AiDiffPdf messages={[message]} />}
          fileName="ai_differentiation_message.pdf"
        >
          <Button
            onClick={() => {
              setPdfTimeout(true);
              setTimeout(() => setPdfTimeout(false), CONFIRM_TIMEOUT_MS);
            }}
            disabled={pdfTimeout}
            color="white"
            size="xs"
            isIconOnly
            icon={{
              iconStyle: 'regular',
              iconName: pdfTimeout ? 'check' : 'file-export',
            }}
            type="primary"
            className={
              pdfTimeout
                ? style.messageFeedbackConfirm
                : style.messageFeedbackButton
            }
          />
        </PDFDownloadLink>
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
