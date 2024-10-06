import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {openNewFolderPrompt as globalOpenNewFolderPrompt} from '@codebridge/FileBrowser/prompts';
import {sendCodebridgeAnalyticsEvent as globalSendCodebridgeAnalyticsEvent} from '@codebridge/utils';
import {useCallback, useMemo} from 'react';

import {usePartialApply} from '@cdo/apps/lab2/hooks';
import {useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

export const usePrompts = () => {
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const dialogControl = useDialogControl();

  const {project, newFolder} = useCodebridgeContext();

  const sendCodebridgeAnalyticsEvent = useCallback(
    (event: string) => globalSendCodebridgeAnalyticsEvent(event, appName),
    [appName]
  );

  const openNewFolderPrompt = usePartialApply(globalOpenNewFolderPrompt, {
    appName,
    dialogControl,
    newFolder,
    projectFolders: project.folders,
    sendCodebridgeAnalyticsEvent,
  });

  return useMemo(() => ({openNewFolderPrompt}), [openNewFolderPrompt]);
};
