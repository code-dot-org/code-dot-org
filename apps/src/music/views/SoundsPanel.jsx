import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './soundsPanel.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {getAllowedLibrarySounds} from '../utils/LibraryUtils';

/*
 * Renders a UI for previewing and choosing samples. This is currently used within a
 * custom Blockly Field {@link FieldSounds}
 */

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

  return (
    <div
      className={classNames(
        styles.soundRow,
        isSelected && styles.soundRowSelected
      )}
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
  allowedSounds,
  currentValue,
  playingPreview,
  onSelect,
  onPreview
}) => {
  const folders = getAllowedLibrarySounds(library, allowedSounds, undefined);

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
  allowedSounds: PropTypes.object,
  currentValue: PropTypes.string.isRequired,
  playingPreview: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired
};

export default SoundsPanel;
