import React, {useCallback, useMemo} from 'react';

import {WorkspaceTeacherViewTab} from '@cdo/apps/aichat/types';
import {isViewingAiTutorVersionFileUpdates} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
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
  const viewingAiTutorVersionFileUpdates = useAppSelector(
    isViewingAiTutorVersionFileUpdates
  );

  // Disable clearing chat when viewing student chat as a teacher,
  // or while waiting for the user to accept/reject AI Tutor code changes.
  const isDisabled = useMemo(
    () =>
      selectedTab === WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY ||
      viewingAiTutorVersionFileUpdates,
    [selectedTab, viewingAiTutorVersionFileUpdates]
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
      variant="text"
      color="tertiary"
      size="extraSmall"
      tooltipSize="xs"
      tooltipDirection="onBottom"
      hideTooltipTail={true}
      disabled={isDisabled}
      onClick={onClear}
    />
  );
};

export default ClearChatButton;
