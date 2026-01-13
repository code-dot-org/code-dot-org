import type {FunctionComponent} from 'react';
import {useCallback, useState} from 'react';

import {HttpClient} from '@code-dot-org/api';
import {Button} from '@code-dot-org/component-library/button';
import type {ProjectSources} from '@code-dot-org/projects';

import LabRegistry from '../../../LabRegistry';
import {setAndSaveProjectSources} from '../../../redux/labProjectSlice';
import {useAppDispatch, useAppSelector} from '../../../redux/store';

import moduleStyles from './save-version-panel.module.scss';

interface SaveVersionPanelProps {
  projectSources: ProjectSources | undefined;
  onSuccess: () => void;
  disabled: boolean;
  buttonLabel: string;
}

const SaveVersionPanel: FunctionComponent<SaveVersionPanelProps> = ({
  projectSources,
  onSuccess,
  disabled,
  buttonLabel,
}) => {
  const [commitDescription, setCommitDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const dispatch = useAppDispatch();

  const onSaveVersion = useCallback(async () => {
    if (!projectSources || isSaving) return;
    setIsSaving(true);
    const projectManager = LabRegistry.projectManager;
    if (!projectManager) {
      console.error('Project manager not available');
      setIsSaving(false);
      return;
    }

    try {
      await dispatch(
        setAndSaveProjectSources(
          projectSources,
          /* forceSave */ true,
          /* forceNewVersion */ true,
        ),
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
            },
          );
          // Set this boolean to true so if any updates occur, a new version is created and this version remains intact and is not overwritten.
          projectManager.setForceNewVersion(true);
          setCommitDescription('');
        } catch (error) {
          console.error('Failed to save commit comment:', error);
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsSaving(false);
    }
  }, [
    commitDescription,
    projectSources,
    dispatch,
    channelId,
    onSuccess,
    isSaving,
  ]);

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
            placeholder="Describe your changes"
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
          text={buttonLabel}
          onClick={onSaveVersion}
          disabled={disabled || isSaving || commitDescription.trim() === ''}
        />
      </div>
    </div>
  );
};

export default SaveVersionPanel;
