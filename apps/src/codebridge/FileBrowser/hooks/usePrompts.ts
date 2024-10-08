import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {
  openNewFolderPrompt as globalOpenNewFolderPrompt,
  openNewFilePrompt as globalOpenNewFilePrompt,
} from '@codebridge/FileBrowser/prompts';
import {sendCodebridgeAnalyticsEvent as globalSendCodebridgeAnalyticsEvent} from '@codebridge/utils';
import {useCallback, useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {usePartialApply, PAFunctionArgs} from '@cdo/apps/lab2/hooks';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

/*
  this is a wrapper hook which will take the various prompt functions available in the prompts folder and usePartialApply
  on them to give us new memoized functions with the infrequently changing/common args passed in.
*/

export const usePrompts = () => {
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const validationFile = useAppSelector(
    state => state.lab.levelProperties?.validationFile
  );
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const dialogControl = useDialogControl();

  const {project, newFolder, newFile} = useCodebridgeContext();

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
  } satisfies PAFunctionArgs<typeof globalOpenNewFolderPrompt>);

  const openNewFilePrompt = usePartialApply(globalOpenNewFilePrompt, {
    appName,
    dialogControl,
    newFile,
    projectFiles: project.files,
    sendCodebridgeAnalyticsEvent,
    isStartMode,
    validationFile,
  } satisfies PAFunctionArgs<typeof globalOpenNewFilePrompt>);

  return useMemo(
    () => ({openNewFilePrompt, openNewFolderPrompt}),
    [openNewFilePrompt, openNewFolderPrompt]
  );
};
