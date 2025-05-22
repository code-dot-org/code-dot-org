import React from 'react';

import {COLORS, COLOR_LABELS, EMOJIS, EMOJI_LABELS} from './avatarConstants';

import styles from './section-avatars.module.scss';

interface PickerGridProps {
  type: 'emoji' | 'color';
  selectCallback: (index: number) => void;
  selected: number;
}

const PickerGrid: React.FC<PickerGridProps> = ({
  type,
  selectCallback,
  selected,
}) => {
  const gridItems =
    type === 'emoji'
      ? EMOJIS.map((item, index) => (
          <button
            key={index}
            title={EMOJI_LABELS[index]}
            type="button"
            className={
              selected === index ? styles.selectedGridItem : styles.gridItem
            }
            onClick={() => selectCallback(index)}
            onKeyDown={event => {
              if (event.key === 'Enter') selectCallback(index);
            }}
          >
            {item}
          </button>
        ))
      : COLORS.map((item, index) => (
          <button
            key={index}
            title={COLOR_LABELS[index]}
            type="button"
            className={
              selected === index ? styles.selectedGridItem : styles.gridItem
            }
            onClick={() => selectCallback(index)}
            onKeyDown={event => {
              if (event.key === 'Enter') selectCallback(index);
            }}
          >
            <div className={styles.colorBox} style={{backgroundColor: item}} />
          </button>
        ));

  return <div className={styles.pickerGrid}>{gridItems}</div>;
};

export default PickerGrid;
