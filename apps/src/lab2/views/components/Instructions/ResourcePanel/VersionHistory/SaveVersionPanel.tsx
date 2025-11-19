import {Button} from '@code-dot-org/component-library/button';
import React, {useCallback, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2I18n from '@cdo/apps/lab2/locale';
import {setAndSaveProjectSources} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {ProjectSources} from '@cdo/apps/lab2/types';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './save-version-panel.module.scss';

interface SaveVersionPanelProps {
  projectSources: ProjectSources | undefined;
  onSuccess: () => void;
  versionLoading: boolean;
  disabled?: boolean;
}

const SaveVersionPanel: React.FC<SaveVersionPanelProps> = ({
  projectSources,
  onSuccess,
  versionLoading,
  disabled = false,
}) => {
  const [commitDescription, setCommitDescription] = useState('');
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const dispatch = useAppDispatch();

  const onSaveVersion = useCallback(async () => {
    if (!projectSources) return;
    const projectManager = Lab2Registry.getInstance().getProjectManager();
    if (!projectManager) {
      console.error('Project manager not available');
      return;
    }

    try {
      // Step 1: Create the version that will have the comment
      await dispatch(
        setAndSaveProjectSources(
          projectSources,
          /* forceSave */ true,
          /* forceNewVersion */ true
        )
      );

      const commentedVersionId = projectManager.getCurrentVersionId();

      // Step 2: Save the comment to this version
      if (commentedVersionId && commitDescription.trim()) {
        const payload = {
          storage_id: channelId,
          version_id: commentedVersionId,
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

      // Step 3: Create a new version to become the new "Current Version"
      // Add a minimal version marker to ensure S3 creates a new version
      // (S3 may not create a new version if content is identical)
      const timestamp = Date.now();
      const newVersionSources = {
        ...projectSources,
        __versionMarker: timestamp,
      };

      await dispatch(
        setAndSaveProjectSources(
          newVersionSources,
          /* forceSave */ true,
          /* forceNewVersion */ true
        )
      );

      // Step 4: Update lastSource to include the marker so it doesn't trigger autosave
      projectManager.setLastSource(newVersionSources);

      // Step 5: Reset the comment flag since the new current version has no comment
      projectManager.setCurrentVersionHasComment(false);

      onSuccess();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  }, [commitDescription, projectSources, dispatch, channelId, onSuccess]);

  return (
    <div className={moduleStyles.footerPanel}>
      <div className={moduleStyles.saveCurrentVersionDescription}>
        <div className={moduleStyles.saveCurrentVersionDescriptionInput}>
          <textarea
            id="commit-description"
            onChange={e => setCommitDescription(e.target.value)}
            value={commitDescription}
            className={moduleStyles.textArea}
            disabled={disabled}
            placeholder={lab2I18n.describeYourChanges()}
          />
        </div>
        <Button
          id="save-version-button"
          size="s"
          type="secondary"
          color="gray"
          iconLeft={{
            iconName: 'save',
            iconStyle: 'solid',
          }}
          className={moduleStyles.versionButton}
          text={lab2I18n.saveCurrentVersion()}
          onClick={onSaveVersion}
          disabled={
            disabled || versionLoading || commitDescription.trim() === ''
          }
        />
      </div>
    </div>
  );
};

export default SaveVersionPanel;
