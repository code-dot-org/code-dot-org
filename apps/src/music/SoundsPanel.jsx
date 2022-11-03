//import PropTypes from 'prop-types';
import React from 'react';
//import styles from './soundsPanel.module.scss';
//import FontAwesome from '@cdo/apps/templates/FontAwesome';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const SoundsPanel = ({onSelect}) => {
  const library = window.library;
  const group = library.groups[0];

  return (
    <div>
      {group.folders.map((folder, folderIndex) => {
        return (
          <div key={folderIndex}>
            {folder.sounds.map((sound, soundIndex) => {
              return (
                <div key={soundIndex}>
                  <FontAwesome icon={'play-circle'} onClick={() => {}} />
                  &nbsp;
                  <span
                    onClick={() => onSelect(folder.name + '/' + sound.name)}
                  >
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

/*
BeatPad.propTypes = {
  triggers: PropTypes.array.isRequired,
  playTrigger: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired
};
*/

export default SoundsPanel;
