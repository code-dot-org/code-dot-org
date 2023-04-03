import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './soundsPanel.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

/*
 * Renders a UI for previewing and choosing samples. This is currently used within a
 * custom Blockly Field {@link FieldSounds}
 */

const getLengthRepresentation = length => {
  const lengthToSymbol = {
    0.5: '\u00bd',
    0.25: '\u00bc'
  };
  return lengthToSymbol[length] || length;
};

const SoundsPanelRow = ({
  currentValue,
  playingPreview,
  folder,
  sound,
  onSelect,
  onPreview
}) => {
  const soundPath = folder.path + '/' + sound.src;
  const isSelected = soundPath === currentValue;
  const isPlayingPreview = playingPreview === soundPath;
  const typeIconPath = `/blockly/media/music/icon-${sound.type}.png`;

  return (
    <div
      className={classNames(
        styles.soundRow,
        isSelected && styles.soundRowSelected
      )}
      onClick={() => onSelect(folder.path + '/' + sound.src)}
    >
      <div className={styles.soundRowLeft}>
        <img src={typeIconPath} className={styles.typeIcon} />
      </div>
      <div className={styles.soundRowMiddle}>{sound.name}</div>
      <div className={styles.soundRowRight}>
        <div className={styles.length}>
          {getLengthRepresentation(sound.length)}
        </div>
        <div className={styles.previewContainer}>
          <FontAwesome
            icon={'play-circle'}
            className={classNames(
              styles.preview,
              isPlayingPreview && styles.previewPlaying
            )}
            onClick={e => {
              if (!isPlayingPreview) {
                onPreview(folder.path + '/' + sound.src);
              }
              e.stopPropagation();
            }}
          />
        </div>
      </div>
    </div>
  );
};

SoundsPanelRow.propTypes = {
  currentValue: PropTypes.string.isRequired,
  playingPreview: PropTypes.string,
  folder: PropTypes.object.isRequired,
  sound: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired
};

const SoundsPanel = ({
  library,
  currentValue,
  playingPreview,
  onSelect,
  onPreview
}) => {
  const folders = library.getAllowedSounds(undefined);

  return (
    <div className={styles.soundsPanel}>
      {folders.map((folder, folderIndex) => {
        return (
          <div className={styles.folder} key={folderIndex}>
            <div className={styles.folderName}>{folder.name}</div>
            {folder.sounds.map((sound, soundIndex) => {
              return (
                <SoundsPanelRow
                  key={soundIndex}
                  currentValue={currentValue}
                  playingPreview={playingPreview}
                  folder={folder}
                  sound={sound}
                  onSelect={onSelect}
                  onPreview={onPreview}
                />
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
