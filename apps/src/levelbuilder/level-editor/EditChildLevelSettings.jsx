// This component will be used to edit the settings of any child levels
// The component will take in the following props:
// Child levels: an array of objects representing the child levels
import Link from '@code-dot-org/component-library/link';
import PropTypes from 'prop-types';
import React, {useState, useCallback} from 'react';

import ImageInput from '@cdo/apps/levelbuilder/ImageInput';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import BubbleChoiceDescriptionEditor from './BubbleChoiceDescriptionEditor';

import styles from './edit-child-level-settings.module.scss';

//Create a boilerplate for the EditChildLevelSettings React component
const EditChildLevelSettings = ({initialChildLevelSettings}) => {
  const [childLevelSettings, setChildLevelSettings] = useState(
    initialChildLevelSettings
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleDisplayNameChange = (index, newDisplayName) => {
    const updatedSettings = childLevelSettings.map((childLevel, i) => {
      if (i === index) {
        return {
          ...childLevel,
          properties: {
            ...childLevel.properties,
            display_name: newDisplayName,
          },
        };
      }
      return childLevel;
    });
    setChildLevelSettings(updatedSettings);
  };

  const handleDescriptionChange = useCallback(
    (index, newDescription) => {
      const updatedSettings = childLevelSettings.map((childLevel, i) => {
        if (i === index) {
          return {
            ...childLevel,
            properties: {
              ...childLevel.properties,
              bubble_choice_description: newDescription,
            },
          };
        }
        return childLevel;
      });
      setChildLevelSettings(updatedSettings);
    },
    [childLevelSettings]
  );

  const handleThumbnailUrlChange = (index, newThumbnailUrl) => {
    const updatedSettings = childLevelSettings.map((childLevel, i) => {
      if (i === index) {
        return {
          ...childLevel,
          properties: {
            ...childLevel.properties,
            thumbnail_url: newThumbnailUrl,
          },
        };
      }
      return childLevel;
    });
    setChildLevelSettings(updatedSettings);
  };

  async function handleSave(index) {
    event.preventDefault();
    const childLevel = childLevelSettings[index];
    const url = `/levels/${childLevel.id}/update_bubble_choice_settings`;
    fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(childLevel.properties),
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
  }

  const uiForEditingSublevelData = (childLevel, index) => (
    <div>
      <div className={styles.fieldRow}>
        <label>Display Name</label>
        <input
          type="text"
          value={childLevel.properties.display_name}
          onChange={e => handleDisplayNameChange(index, e.target.value)}
        />
      </div>
      <BubbleChoiceDescriptionEditor
        description={childLevel.properties.bubble_choice_description || ''}
        index={index}
        handleDescriptionChange={handleDescriptionChange}
      />
      <div className={styles.fieldRow}>
        <label>Thumbnail URL</label>
        <ImageInput
          updateImageUrl={newImageUrl =>
            handleThumbnailUrlChange(index, newImageUrl)
          }
          initialImageUrl={childLevel.properties.thumbnail_url || ''}
          showPreview
        />
      </div>
      <button type="button" onClick={() => handleSave(index)}>
        Save
      </button>
    </div>
  );

  const levelEditorUrl = childLevelId => `/levels/${childLevelId}/edit`;

  return (
    <>
      <div>
        <h3>This level has {childLevelSettings.length} sublevels.</h3>
        {saveSuccess && (
          <div className={styles.successMessage}>Save successful!</div>
        )}
        <div>
          {childLevelSettings.map((childLevel, index) => (
            <div className={styles.collapsibleFieldSection} key={index}>
              <hr />
              <CollapsibleSection headerContent={childLevel.name}>
                <div>
                  {childLevel.isDslDefined && (
                    <div className={styles.warningMessage}>
                      Note: This level is a DSL level. To make changes to the
                      title, description, or thumbnail, you must edit the DSL
                      level directly. You can do that at
                      <Link
                        text={'the level edit page'}
                        href={levelEditorUrl(childLevel.id)}
                        openInNewTab={true}
                        external={true}
                        size="s"
                      />
                    </div>
                  )}
                  {!childLevel.isDslDefined &&
                    uiForEditingSublevelData(childLevel, index)}
                </div>
              </CollapsibleSection>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

//Export the EditChildLevelSettings component
export default EditChildLevelSettings;

//Define the prop types for the EditChildLevelSettings component
EditChildLevelSettings.propTypes = {
  initialChildLevelSettings: PropTypes.array,
};
