import React from 'react';
import PropTypes from 'prop-types';
//import styles from './soundsPanel.module.scss';
//import FontAwesome from '@cdo/apps/templates/FontAwesome';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const SoundsPanel = ({library, onSelect, onPreview}) => {
  const group = library.groups[0];

  return (
    <div>
      {group.folders.map((folder, folderIndex) => {
        return (
          <div key={folderIndex}>
            {folder.sounds.map((sound, soundIndex) => {
              return (
                <div key={soundIndex}>
                  <FontAwesome
                    icon={'play-circle'}
                    onClick={() => onPreview(folder.path + '/' + sound.src)}
                  />
                  &nbsp;
                  <span onClick={() => onSelect(folder.path + '/' + sound.src)}>
                    {folder.name} / {sound.name}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

SoundsPanel.propTypes = {
  library: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired
};

export default SoundsPanel;
