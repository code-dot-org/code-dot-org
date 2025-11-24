import Button from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React from 'react';

import {addChatEvent} from '@cdo/apps/aichat/redux/thunks/addChatEvent';
import {getNewRemoveId} from '@cdo/apps/aichat/redux/utils';
import {Notification} from '@cdo/apps/aichat/types/chatEvents';
import {
  setSource,
  setViewingAiTutorVersion,
  setProjectSourceBeforeAiTutorVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {setAiFilePathToPreview} from '@cdo/apps/weblab2/redux';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import CopyableCodeBlock from '../copyableCodeBlock/CopyableCodeBlock';

import {Role} from './types';

import moduleStyles from './chat-message.module.scss';
interface ChatMessageProps {
  text: string;
  role: Role;
  customStyles?: {[label: string]: string};
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isTA?: boolean;
  messageStyle?: 'default' | 'warning' | 'danger';
  isAiTutorVersion?: boolean;
}

/*
 * A rehype component map used to map between `pre` tags and `CopyableCodeBlock` components.
 *
 * For performance reasons, it is the `SafeMarkdown` consumer's responsibility to create the
 * rehypeMap outside  of the component function or to define the mapping in an ES module and
 * import it, if used in multiple components. See `SafeMarkdown` for more info.
 **/
const rehypeMap = {pre: CopyableCodeBlock};

const ChatMessage: React.FunctionComponent<ChatMessageProps> = ({
  text,
  role,
  customStyles,
  header,
  footer,
  isTA,
  messageStyle = 'default',
  isAiTutorVersion = false,
}) => {
  const dispatch = useAppDispatch();
  const prevSource = useAppSelector(
    state => state.lab2Project.projectSourceBeforeAiTutorVersion
  );
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  );

  const handleAccept = () => {
    const notification: Notification = {
      timestamp: Date.now(),
      removeId: getNewRemoveId(),
      text: "You accepted AI Tutor's changes.",
      notificationType: 'success',
      includeInChatHistory: true,
      hideTimestamp: true,
    };
    dispatch(addChatEvent(notification));
    dispatch(setViewingAiTutorVersion(false));
    dispatch(setAiFilePathToPreview(undefined));
    dispatch(setProjectSourceBeforeAiTutorVersion(undefined));
    // Update current source so that isAiTutorVersionUpdated and isAiTutorVersionCreated are set to false.
    if (source) {
      const sourceToUpdate = source as MultiFileSource;
      const updatedSource = {
        ...sourceToUpdate,
        files: Object.fromEntries(
          Object.entries(sourceToUpdate.files).map(([fileId, file]) => [
            fileId,
            {
              ...file,
              isAiTutorVersionUpdated: false,
              isAiTutorVersionCreated: false,
            },
          ])
        ),
      };
      dispatch(setSource(updatedSource));
    }
  };

  const handleReject = () => {
    const notification: Notification = {
      timestamp: Date.now(),
      removeId: getNewRemoveId(),
      text: "You rejected AI Tutor's changes.",
      notificationType: 'error',
      includeInChatHistory: true,
      hideTimestamp: true,
    };
    dispatch(addChatEvent(notification));
    dispatch(setSource(prevSource || (source as MultiFileSource)));
    dispatch(setViewingAiTutorVersion(false));
    dispatch(setAiFilePathToPreview(undefined));
    dispatch(setProjectSourceBeforeAiTutorVersion(undefined));
  };

  return (
    <div
      className={classNames(
        moduleStyles[`message-container-${role}`],
        customStyles && customStyles[`message-container-${role}`],
        'uitest-chat-message'
      )}
    >
      <div className={moduleStyles.messageWithChildren}>
        {header && <div>{header}</div>}
        <div className={moduleStyles[`container-${role}`]}>
          {role === Role.ASSISTANT && (
            <div
              className={classNames(
                isTA && moduleStyles.botIconContainerWithOverlay
              )}
            >
              <div className={classNames(moduleStyles.botIconContainer)}>
                <img
                  src={aiBotOutlineIcon}
                  alt={commonI18n.aiChatBotIconAlt()}
                  className={moduleStyles.botIcon}
                />
              </div>
              {isTA && (
                <div className={moduleStyles.botOverlay}>
                  <span>{'TA'}</span>
                </div>
              )}
            </div>
          )}
          <div
            className={classNames(
              moduleStyles[`message-${role}`],
              customStyles && customStyles[`message-${role}`],
              messageStyle === 'danger' && moduleStyles.danger,
              messageStyle === 'warning' && moduleStyles.warning
            )}
            aria-label={
              role === Role.ASSISTANT
                ? commonI18n.aiChatMessageBot()
                : commonI18n.aiChatMessageUser()
            }
          >
            {role === Role.ASSISTANT ? (
              <div className={moduleStyles.assistantMessageContent}>
                <SafeMarkdown
                  markdown={text}
                  rehypeMap={rehypeMap}
                  openExternalLinksInNewTab
                />
                {isAiTutorVersion && (
                  <div className={moduleStyles.assistantButtonContainer}>
                    <Button
                      text="Reject"
                      size="s"
                      color="gray"
                      type="secondary"
                      iconLeft={{
                        iconStyle: 'solid',
                        iconName: 'close',
                        title: 'Reject',
                      }}
                      onClick={handleReject}
                    />
                    <Button
                      text="Accept"
                      size="s"
                      type="primary"
                      color="purple"
                      iconLeft={{
                        iconStyle: 'solid',
                        iconName: 'check',
                        title: 'Accept',
                      }}
                      onClick={handleAccept}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p>{text}</p>
            )}
          </div>
        </div>
        {footer && (
          <div
            className={
              isTA ? moduleStyles.footerWithOverlay : moduleStyles.footer
            }
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
