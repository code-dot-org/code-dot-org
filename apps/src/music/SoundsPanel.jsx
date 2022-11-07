import React from 'react';
import PropTypes from 'prop-types';
import styles from './soundsPanel.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const getSoundRowClassName = (currentValue, folderPath, soundSrc) => {
  if (currentValue === folderPath + '/' + soundSrc) {
    return styles.soundRowSelected;
  } else {
    return styles.soundRow;
  }
};

const SoundsPanel = ({library, currentValue, onSelect, onPreview}) => {
  const group = library.groups[0];

  return (
    <div className={styles.soundsPanel}>
      {group.folders.map((folder, folderIndex) => {
        return (
          <div key={folderIndex}>
            <div
              className={
                folderIndex === 0 ? styles.folderRowFirst : styles.folderRow
              }
            >
              {folder.name}
            </div>
            {folder.sounds.map((sound, soundIndex) => {
              return (
                <div
                  className={getSoundRowClassName(
                    currentValue,
                    folder.path,
                    sound.src
                  )}
                  key={soundIndex}
                >
                  <div
                    className={styles.soundRowLeft}
                    onClick={() => onSelect(folder.path + '/' + sound.src)}
                  >
                    {sound.name}
                  </div>
                  <div className={styles.soundRowRight}>
                    <FontAwesome
                      icon={'play-circle'}
                      onClick={() => onPreview(folder.path + '/' + sound.src)}
                    />
                  </div>
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
  currentValue: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired
};

export default SoundsPanel;
