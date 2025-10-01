import React, {useCallback, useMemo} from 'react';

import {WorkspaceTeacherViewTab} from '@cdo/apps/aichat/types';
import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import aichatI18n from '../../locale';
import {addChatEvent, clearChatMessages, sendAnalytics} from '../../redux';

const ClearChatButton: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const selectedTab = useAppSelector(
    state => state.aichat.chatWorkspaceSelectedTab
  );

  // Disable clearing chat when viewing student chat as a teacher
  const isDisabled = useMemo(
    () => selectedTab === WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY,
    [selectedTab]
  );

  const onClear = useCallback(() => {
    dispatch(clearChatMessages());
    dispatch(
      addChatEvent({
        timestamp: Date.now(),
        descriptionKey: 'CLEAR_CHAT',
      })
    );
    dispatch(
      sendAnalytics(EVENTS.CHAT_ACTION, {
        action: 'Clear chat history',
      })
    );
  }, [dispatch]);

  return (
    <IconButtonWithTooltip
      id="clear-chat"
      label={aichatI18n.clearChatButtonText()}
      icon={{iconName: 'eraser', iconStyle: 'solid'}}
      type="tertiary"
      color="gray"
      buttonSize="xs"
      tooltipSize="xs"
      tooltipDirection="onBottom"
      hideTooltipTail={true}
      disabled={isDisabled}
      onClick={onClear}
    />
  );
};

export default ClearChatButton;
