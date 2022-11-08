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

const getPreviewClassName = (playingPreview, folderPath, soundSrc) => {
  if (playingPreview === folderPath + '/' + soundSrc) {
    return styles.previewPlaying;
  } else {
    return styles.preview;
  }
};

const getIcon = type => {
  const typeToIcon = {
    beat: 'volume-up',
    bass: 'headphones',
    lead: 'music',
    fx: 'asterisk'
  };
  return typeToIcon[type];
};

const getIconClassName = type => {
  return styles['icon-' + type];
};

const SoundsPanel = ({
  library,
  currentValue,
  playingPreview,
  onSelect,
  onPreview
}) => {
  const group = library.groups[0];

  return (
    <div className={styles.soundsPanel}>
      {group.folders.map((folder, folderIndex) => {
        return (
          <div
            className={folderIndex === 0 ? styles.folderFirst : styles.folder}
            key={folderIndex}
          >
            <div className={styles.folderName}>{folder.name}</div>
            {folder.sounds.map((sound, soundIndex) => {
              return (
                <div
                  className={getSoundRowClassName(
                    currentValue,
                    folder.path,
                    sound.src
                  )}
                  key={soundIndex}
                  onClick={() => onSelect(folder.path + '/' + sound.src)}
                >
                  <div className={styles.soundRowLeft}>
                    <FontAwesome
                      icon={getIcon(sound.type)}
                      className={getIconClassName(sound.type)}
                    />
                  </div>
                  <div className={styles.soundRowMiddle}>{sound.name}</div>
                  <div className={styles.soundRowRight}>
                    <FontAwesome
                      icon={'play-circle'}
                      className={getPreviewClassName(
                        playingPreview,
                        folder.path,
                        sound.src
                      )}
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
  playingPreview: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired
};

export default SoundsPanel;
