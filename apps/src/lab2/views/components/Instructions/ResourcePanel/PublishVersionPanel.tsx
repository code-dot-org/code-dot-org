// PublishVersionPanel.tsx
import {Button} from '@code-dot-org/component-library/button';
import {OverlineTwoText} from '@code-dot-org/component-library/typography';
import React, {useCallback, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2I18n from '@cdo/apps/lab2/locale';
import {setAndSaveProjectSources} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './version-history-panel.module.scss';

interface PublishVersionPanelProps {
  projectSources: ProjectSources | undefined;
  onSuccess: () => void;
  versionLoading: boolean;
}

const PublishVersionPanel: React.FC<PublishVersionPanelProps> = ({
  projectSources,
  onSuccess,
  versionLoading,
}) => {
  const [commitDescription, setCommitDescription] = useState('');
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const dispatch = useAppDispatch();

  const onPublishVersion = useCallback(async () => {
    if (!projectSources) return;
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (!projectManager) {
      console.error('Project manager not available');
      return;
    }

    try {
      await dispatch(
        setAndSaveProjectSources(
          projectSources,
          /* forceSave */ true,
          /* forceNewVersion */ true
        )
      );

      const newVersionId = projectManager.getCurrentVersionId();

      if (newVersionId && commitDescription.trim()) {
        const payload = {
          storage_id: channelId,
          version_id: newVersionId,
          comment: commitDescription,
        };

        try {
          await HttpClient.post(
            '/project_commits',
            JSON.stringify(payload),
            true,
            {
              'Content-Type': 'application/json; charset=UTF-8',
            }
          );
          projectManager.setCurrentVersionHasComment(true);
          setCommitDescription('');
        } catch (error) {
          console.error('Failed to save commit comment:', error);
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  }, [commitDescription, projectSources, dispatch, channelId, onSuccess]);

  return (
    <div className={moduleStyles.footerPanel}>
      <div className={moduleStyles.publishCurrentVersionHeader}>
        <div className={moduleStyles.publishCurrentVersionHeaderText}>
          <OverlineTwoText className={moduleStyles.overlineTwoText}>
            {lab2I18n.publishCurrentVersion()}
          </OverlineTwoText>
        </div>
      </div>
      <div className={moduleStyles.publishCurrentVersionDescription}>
        <div className={moduleStyles.publishCurrentVersionDescriptionInput}>
          <div className={moduleStyles.label}>
            {lab2I18n.describeYourChanges()}
          </div>
          <textarea
            onChange={e => setCommitDescription(e.target.value)}
            value={commitDescription}
            className={moduleStyles.textArea}
          />
        </div>
        <Button
          id="publish-version-button"
          size="s"
          className={moduleStyles.versionButton}
          text={commonI18n.publish()}
          onClick={onPublishVersion}
          disabled={versionLoading || commitDescription.trim() === ''}
        />
      </div>
    </div>
  );
};

export default PublishVersionPanel;
