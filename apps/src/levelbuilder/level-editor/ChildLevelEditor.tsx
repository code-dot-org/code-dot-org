import React, {useCallback, useState} from 'react';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import ImageInput from '../ImageInput';

import BubbleChoiceDescriptionEditor from './BubbleChoiceDescriptionEditor';

import styles from './edit-child-level-settings.module.scss';

interface ChildLevelEditorProps {
  childLevel: {
    id: number;
    isDslDefined: boolean;
    name: string;
    properties: {
      // These are the properties that we care about for editing sublevel settings.
      bubble_choice_description?: string;
      display_name?: string;
      thumbnail_url?: string;
    };
  };
  setSaveSuccess: (success: boolean) => void;
  index: number;
}
const ChildLevelEditor: React.FC<ChildLevelEditorProps> = ({
  childLevel,
  setSaveSuccess,
  index,
}) => {
  const [childLevelDisplayName, setChildLevelDisplayName] = useState(
    childLevel.properties.display_name || ''
  );
  const [childLevelDescription, setChildLevelDescription] = useState(
    childLevel.properties.bubble_choice_description || ''
  );
  const [childLevelThumbnailUrl, setChildLevelThumbnailUrl] = useState(
    childLevel.properties.thumbnail_url || ''
  );

  const handleSave = useCallback(async () => {
    const url = `/levels/${childLevel.id}/update_bubble_choice_settings`;
    const properties = {
      ...childLevel.properties,
      display_name: childLevelDisplayName,
      bubble_choice_description: childLevelDescription,
      thumbnail_url: childLevelThumbnailUrl,
    };
    fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(properties),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [
    childLevel.id,
    childLevel.properties,
    childLevelDisplayName,
    childLevelDescription,
    childLevelThumbnailUrl,
    setSaveSuccess,
  ]);
  return (
    <div>
      <div className={styles.fieldRow}>
        <label>Display Name</label>
        <input
          type="text"
          value={childLevelDisplayName}
          onChange={e => setChildLevelDisplayName(e.target.value)}
        />
      </div>
      <BubbleChoiceDescriptionEditor
        description={childLevelDescription}
        index={index}
        handleDescriptionChange={setChildLevelDescription}
      />
      <div className={styles.fieldRow}>
        <label>Thumbnail URL</label>
        <ImageInput
          updateImageUrl={setChildLevelThumbnailUrl}
          initialImageUrl={childLevelThumbnailUrl}
          showPreview
        />
      </div>
      <button type="button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
};

export default ChildLevelEditor;
