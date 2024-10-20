//Create a boilerplate for the EditChildLevelSettings component
//This component will be used to edit the settings of any child levels
//The component will take in the following props:
//Child levels: an array of objects representing the child levels
import PropTypes from 'prop-types';
import React from 'react';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

//Create a boilerplate for the EditChildLevelSettings React component
const EditChildLevelSettings = ({initialChildLevelSettings}) => {
  const [childLevelSettings, setChildLevelSettings] = React.useState(
    initialChildLevelSettings
  );

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

  async function handleSave(index) {
    event.preventDefault();
    const childLevel = childLevelSettings[index];
    // Here you would typically make an API call to save the changes for the specific child level
    console.log(`Saving changes for child level ${index}:`, childLevel);
    // Example API call (uncomment and replace with actual API endpoint)
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
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  return (
    <>
      <div>
        <h3>This level has {childLevelSettings.length} sublevels.</h3>
        <div>
          {childLevelSettings.map((childLevel, index) => (
            <div key={index} style={{marginBottom: '20px'}}>
              <h4>
                <input
                  type="text"
                  value={childLevel.properties.display_name}
                  onChange={e => handleDisplayNameChange(index, e.target.value)}
                />
              </h4>
              <img
                src={childLevel.properties.thumbnail_url}
                alt={`${childLevel.properties.display_name} thumbnail`}
                style={{maxWidth: '100px', maxHeight: '100px'}}
              />
              <button type="button" onClick={() => handleSave(index)}>
                Save
              </button>
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
