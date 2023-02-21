import React, {useState} from 'react';
import PropTypes from 'prop-types';
import styles from './soundsPanel.module.scss';
//import FontAwesome from '@cdo/apps/templates/FontAwesome';

/*
 * Renders a UI for designing a pattern. This is currently used within a
 * custom Blockly Field {@link FieldSounds}
 */

const PatternPanel = ({
  library,
  currentValue,
  playingPreview,
  onSelect,
  onPreview
}) => {
  const [count, setCount] = useState(0);

  const group = library.groups[0];

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

    setCount(count + 1);
  };

  const getGridPointSet = (sound, tick) => {
    const index = currentValue.events.findIndex(
      event => event.src === sound.src && event.tick === tick
    );
    return index !== -1;
  };

  // Generate an array containing tick numbers from 1..16.
  const arrayOfTicks = Array.from({length: 16}, (_, i) => i + 1);
  const currentFolder = group.folders[0];

  //const events = [];

  return (
    <div className={styles.soundsPanel}>
      {group.folders
        .filter(folder => folder.type === 'kit')
        .map((folder, folderIndex) => {
          return <div key={folderIndex}>{folder.name}</div>;
        })}

      {currentFolder.sounds.map((sound, soundIndex) => {
        return (
          <div key={soundIndex}>
            <div style={{display: 'inline-block', width: 60}}>{sound.name}</div>
            {arrayOfTicks.map((tick, tickIndex) => {
              return (
                <div
                  style={{display: 'inline-block', width: 15}}
                  onClick={() => toggleGridPoint(sound, tick)}
                  key={tickIndex}
                >
                  {getGridPointSet(sound, tick) ? 'x' : 'o'}
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
  currentValue: PropTypes.object.isRequired,
  playingPreview: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired
};

export default PatternPanel;
