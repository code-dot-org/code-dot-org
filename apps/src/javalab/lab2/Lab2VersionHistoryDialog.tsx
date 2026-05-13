// Thin lab2 wrapper around the legacy VersionHistoryWithCommitsDialog.
//
// The legacy dialog talks to the server via clientApi.sourcesApi, which
// reads the channel ID from the legacy `project` singleton and reloads the
// page after a restore. Under lab2 we route those operations through the
// lab2 ProjectManager (which already knows the channel) and refresh the
// editor in place — no reload required.

import React, {useCallback} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import VersionHistoryWithCommitsDialog from '@cdo/apps/templates/VersionHistoryWithCommitsDialog';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {setAllSourcesAndFileMetadata} from '../redux/editorRedux';

import {isJavalabSource} from './types';

interface Lab2VersionHistoryDialogProps {
  handleClearPuzzle: () => Promise<unknown> | void;
  isProjectTemplateLevel: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const Lab2VersionHistoryDialog: React.FC<
  Lab2VersionHistoryDialogProps
> = props => {
  const dispatch = useAppDispatch();

  const fetchVersions = useCallback(async () => {
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (!projectManager) return [];
    // include comments so the dialog can render the commit message column
    return await projectManager.getVersionList(true);
  }, []);

  const restoreVersion = useCallback(
    async (versionId: string) => {
      const projectManager = Lab2Registry.getInstance().getProjectManager();
      if (!projectManager) return;
      const restored = await projectManager.restoreSources(versionId);
      // Reflect the restored sources in the editor immediately. useSourcesBridge
      // will see the change and treat it as the new baseline.
      if (restored && isJavalabSource(restored.source)) {
        dispatch(setAllSourcesAndFileMetadata(restored.source, false));
      }
    },
    [dispatch]
  );

  const onClearAndSave = useCallback(async () => {
    // handleClearPuzzle (in JavaLab2View) resets editor sources to the level's
    // start sources. useSourcesBridge picks up the change and dispatches a
    // throttled save; flushSave forces it through immediately so the next
    // load — for this or any other tab — sees the cleared state.
    await Lab2Registry.getInstance().getProjectManager()?.flushSave();
  }, []);

  return (
    <VersionHistoryWithCommitsDialog
      {...props}
      fetchVersions={fetchVersions}
      restoreVersion={restoreVersion}
      onClearAndSave={onClearAndSave}
    />
  );
};

export default Lab2VersionHistoryDialog;
