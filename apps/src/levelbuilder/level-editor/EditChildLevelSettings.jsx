//Create a boilerplate for the EditChildLevelSettings component
//This component will be used to edit the settings of any child levels
//The component will take in the following props:
//Child levels: an array of objects representing the child levels
import PropTypes from 'prop-types';
import React from 'react';

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

  return (
    <>
      <input
        type="hidden"
        id="child_level_settings"
        name="level[child_level_settings]"
        value={JSON.stringify(childLevelSettings)}
      />
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
