import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './patternPanel.module.scss';

// Generate an array containing tick numbers from 1..16.
const arrayOfTicks = Array.from({length: 16}, (_, i) => i + 1);

/*
 * Renders a UI for designing a pattern. This is currently used within a
 * custom Blockly Field {@link FieldSounds}
 */

const PatternPanel = ({library, initValue, onChange}) => {
  // Make a copy of the value object so that we don't overwrite Blockly's
  // data.
  const currentValue = {...initValue};

  const group = library.groups[0];
  const currentFolder = library.groups[0].folders.find(
    folder => folder.path === currentValue.kit
  );

  const toggleEvent = (sound, tick) => {
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

  const hasEvent = (sound, tick) => {
    const element = currentValue.events.find(
      event => event.src === sound.src && event.tick === tick
    );
    return !!element;
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
    const isSet = hasEvent(sound, tick);
    const isHighlighted = !isSet && (tick - 1) % 4 === 0;

    return classNames(
      styles.cell,
      isSet && styles.activeCell,
      isHighlighted && styles.highlightedCell
    );
  };

  return (
    <div className={styles.patternPanel}>
      <select value={currentValue.kit} onChange={handleFolderChange}>
        {group.folders
          .filter(folder => folder.type === 'kit')
          .map(folder => (
            <option key={folder.path} value={folder.path}>
              {folder.name}
            </option>
          ))}
      </select>
      {currentFolder.sounds.map(sound => {
        return (
          <div className={styles.row} key={sound.src}>
            <div className={styles.name}>{sound.name}</div>
            {arrayOfTicks.map(tick => {
              return (
                <div
                  className={styles.outerCell}
                  onClick={() => toggleEvent(sound, tick)}
                  key={tick}
                >
                  <div className={getCellClasses(sound, tick)} />
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
  onChange: PropTypes.func.isRequired
};

export default PatternPanel;
