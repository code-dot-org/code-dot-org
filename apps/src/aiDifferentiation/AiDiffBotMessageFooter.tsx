import Button from '@code-dot-org/component-library/button';
import {PDFDownloadLink} from '@react-pdf/renderer';
import React, {useState} from 'react';

import CopyButton from '@cdo/apps/aiComponentLibrary/copyButton/CopyButton';
import {commonI18n} from '@cdo/apps/types/locale';

import {EVENTS, PLATFORMS} from '../metrics/AnalyticsConstants';
import analyticsReporter from '../metrics/AnalyticsReporter';
import HttpClient from '../util/HttpClient';

import AiDiffPdf from './AiDiffPdf';
import {ChatTextMessage} from './types';

import style from './ai-differentiation.module.scss';

interface Props {
  message: ChatTextMessage;
  reportingData: object;
}

const AiDiffBotMessageFooter: React.FC<Props> = ({message, reportingData}) => {
  const CONFIRM_TIMEOUT_MS = 1500;
  const [pdfTimeout, setPdfTimeout] = useState(false);
  const [thumbsUp, setThumbsUp] = useState(false);
  const [thumbsDown, setThumbsDown] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const sendChatFeedbackEvent = React.useCallback(
    (thumbsUp: boolean, thumbsDown: boolean, flagged: boolean) => {
      const feedbackEventData = {
        ...reportingData,
        thumbsUp: thumbsUp,
        thumbsDown: thumbsDown,
        flagged: flagged,
        text: message.chatMessageText,
        messageId: message.id,
      };
      analyticsReporter.sendEvent(
        EVENTS.AI_DIFF_FEEDBACK_EVENT,
        feedbackEventData,
        PLATFORMS.STATSIG
      );
    },
    [reportingData, message]
  );

  const onFeedbackClick = (
    thumbsUpBtn: boolean,
    thumbsDownBtn: boolean,
    flaggedBtn: boolean
  ) => {
    if (message.id === undefined) {
      setThumbsUp(thumbsUpBtn);
      setThumbsDown(thumbsDownBtn);
      setFlagged(flaggedBtn);
      return;
    }

    sendChatFeedbackEvent(thumbsUpBtn, thumbsDownBtn, flaggedBtn);
    let approval = null;
    if (thumbsUpBtn) {
      approval = true;
    } else if (thumbsDownBtn) {
      approval = false;
    }

    const body = JSON.stringify({
      approval: approval,
      flagged: flaggedBtn,
    });
    HttpClient.post(
      `/aichat_messages/${message.id}/submit_feedback`,
      body,
      true,
      {
        'Content-Type': 'application/json',
      }
    )
      .then(response => {
        if (response.ok) {
          setThumbsUp(thumbsUpBtn);
          setThumbsDown(thumbsDownBtn);
          setFlagged(flaggedBtn);
        }
      })
      .catch(error => console.log(error));
  };

  return (
    <div className={style.messageFeedbackContainer}>
      <div className={style.messageFeedbackLeft}>
        <CopyButton copyText={message.chatMessageText} />
        <PDFDownloadLink
          document={<AiDiffPdf messages={[message]} />}
          fileName="ai_differentiation_message.pdf"
        >
          <Button
            aria-label={commonI18n.aiDifferentiation_download_pdf()}
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
          aria-label={commonI18n.aiDifferentiationThumbsUp()}
          onClick={() => onFeedbackClick(!thumbsUp, false, flagged)}
          color="white"
          size="xs"
          isIconOnly
          icon={{iconStyle: 'regular', iconName: 'thumbs-up'}}
          type="primary"
          className={
            thumbsUp
              ? style.messageFeedbackConfirm
              : style.messageFeedbackButton
          }
        />
        <Button
          aria-label={commonI18n.aiDifferentiationThumbsDown()}
          onClick={() => onFeedbackClick(false, !thumbsDown, flagged)}
          color="white"
          size="xs"
          isIconOnly
          icon={{iconStyle: 'regular', iconName: 'thumbs-down'}}
          type="primary"
          className={
            thumbsDown
              ? style.messageFeedbackNegative
              : style.messageFeedbackButton
          }
        />
        <Button
          aria-label={commonI18n.aiDifferentiationFlag()}
          onClick={() => onFeedbackClick(thumbsUp, thumbsDown, !flagged)}
          color="white"
          size="xs"
          isIconOnly
          icon={{iconStyle: 'regular', iconName: 'flag-pennant'}}
          type="primary"
          className={
            flagged
              ? style.messageFeedbackNegative
              : style.messageFeedbackButton
          }
        />
      </div>
    </div>
  );
};

export default AiDiffBotMessageFooter;
