import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './patternPanel.module.scss';
//import FontAwesome from '@cdo/apps/templates/FontAwesome';

/*
 * Renders a UI for designing a pattern. This is currently used within a
 * custom Blockly Field {@link FieldSounds}
 */

const PatternPanel = ({
  library,
  initValue,
  playingPreview,
  onChange,
  onPreview
}) => {
  // Make a copy of the value object so that we don't overwrite Blockly's
  // data.
  const currentValue = {...initValue};

  const group = library.groups[0];
  const currentFolder = library.groups[0].folders.find(
    folder => folder.path === currentValue.kit
  );

  const toggleGridPoint = (sound, tick) => {
    console.log(sound.src, tick);

    const index = currentValue.events.findIndex(
      event => event.src === sound.src && event.tick === tick
    );
    if (index !== -1) {
      // If found, delete.
      currentValue.events.splice(index, 1);
    } else {
      // Not found, so add.
      currentValue.events.push({src: sound.src, tick});
    }

    onChange(currentValue);
  };

  const getGridPointSet = (sound, tick) => {
    const index = currentValue.events.findIndex(
      event => event.src === sound.src && event.tick === tick
    );
    return index !== -1;
  };

  const handleFolderChange = event => {
    const value = event.target.value;
    const folder = library.groups[0].folders.find(
      folder => folder.path === value
    );
    currentValue.kit = folder.path;
    onChange(currentValue);
  };

  const getCellClasses = (sound, tick) => {
    const isSet = getGridPointSet(sound, tick);
    const isHighlighted = !isSet && (tick - 1) % 4 === 0;

    return classNames(
      styles.cell,
      isSet && styles.activeCell,
      isHighlighted && styles.highlightedCell
    );
  };

  // Generate an array containing tick numbers from 1..16.
  const arrayOfTicks = Array.from({length: 16}, (_, i) => i + 1);

  return (
    <div className={styles.patternPanel}>
      <select value={currentValue.kit} onChange={handleFolderChange}>
        {group.folders
          .filter(folder => folder.type === 'kit')
          .map((folder, folderIndex) => (
            <option key={folderIndex} value={folder.path}>
              {folder.name}
            </option>
          ))}
      </select>
      {currentFolder.sounds.map((sound, soundIndex) => {
        return (
          <div className={styles.row} key={soundIndex}>
            <div className={styles.name}>{sound.name}</div>
            {arrayOfTicks.map((tick, tickIndex) => {
              return (
                <div
                  className={styles.outerCell}
                  onClick={() => toggleGridPoint(sound, tick)}
                >
                  <div
                    className={getCellClasses(sound, tick)}
                    key={tickIndex}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

PatternPanel.propTypes = {
  library: PropTypes.object.isRequired,
  initValue: PropTypes.object.isRequired,
  playingPreview: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired
};

export default PatternPanel;
