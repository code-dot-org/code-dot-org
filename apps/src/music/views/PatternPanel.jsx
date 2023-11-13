import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './patternPanel.module.scss';
import PreviewControls from './PreviewControls';

// Generate an array containing tick numbers from 1..16.
const arrayOfTicks = Array.from({length: 16}, (_, i) => i + 1);

/*
 * Renders a UI for designing a pattern. This is currently used within a
 * custom Blockly Field {@link FieldPattern}
 */

const PatternPanel = ({
  bpm,
  library,
  initValue,
  onChange,
  previewSound,
  previewPattern,
  cancelPreviews,
}) => {
  // Make a copy of the value object so that we don't overwrite Blockly's
  // data.
  const currentValue = JSON.parse(JSON.stringify(initValue));

  const group = library.groups[0];
  const currentFolder = library.getFolderForPath(currentValue.kit);
  const [currentPreviewTick, setCurrentPreviewTick] = useState(0);

  const toggleEvent = useCallback(
    (sound, tick) => {
      const index = currentValue.events.findIndex(
        event => event.src === sound.src && event.tick === tick
      );
      if (index !== -1) {
        // If found, delete.
        currentValue.events.splice(index, 1);
      } else {
        // Not found, so add.
        currentValue.events.push({src: sound.src, tick});
        previewSound(`${currentValue.kit}/${sound.src}`);
      }

      onChange(currentValue);
    },
    [onChange, previewSound, currentValue]
  );

  const hasEvent = (sound, tick) => {
    const element = currentValue.events.find(
      event => event.src === sound.src && event.tick === tick
    );
    return !!element;
  };

  const handleFolderChange = event => {
    const value = event.target.value;
    const folder = library.getFolderForPath(value);
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

  const onClear = useCallback(() => {
    currentValue.events = [];
    onChange(currentValue);
  }, [onChange, currentValue]);

  const startPreview = useCallback(() => {
    setCurrentPreviewTick(1);
    const intervalId = setInterval(
      () => setCurrentPreviewTick(tick => tick + 1),
      // Tick forward every 16th note, i.e. 4 times per beat.
      (60 / bpm / 4) * 1000
    );
    previewPattern(currentValue, () => {
      clearInterval(intervalId);
      setCurrentPreviewTick(0);
    });
  }, [previewPattern, bpm, setCurrentPreviewTick, currentValue]);

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
            <div className={styles.nameContainer}>
              <span
                className={styles.name}
                onClick={() => previewSound(`${currentValue.kit}/${sound.src}`)}
              >
                {sound.name}
              </span>
            </div>
            {arrayOfTicks.map(tick => {
              return (
                <div
                  className={classNames(
                    styles.outerCell,
                    tick === currentPreviewTick && styles.outerCellPlaying
                  )}
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
      <PreviewControls
        enabled={currentValue.events.length > 0}
        playPreview={startPreview}
        onClickClear={onClear}
        cancelPreviews={cancelPreviews}
      />
    </div>
  );
};

PatternPanel.propTypes = {
  library: PropTypes.object.isRequired,
  bpm: PropTypes.number.isRequired,
  initValue: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  previewSound: PropTypes.func.isRequired,
  previewPattern: PropTypes.func.isRequired,
  cancelPreviews: PropTypes.func.isRequired,
};

export default PatternPanel;
