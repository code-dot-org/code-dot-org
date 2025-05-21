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
            type="button"
            aria-label={EMOJI_LABELS[index]}
            className={
              selected === index ? styles.selectedGridItem : styles.gridItem
            }
            onClick={() => selectCallback(index)}
          >
            {item}
          </button>
        ))
      : COLORS.map((item, index) => (
          <button
            key={index}
            type="button"
            aria-label={COLOR_LABELS[index]}
            className={
              selected === index ? styles.selectedGridItem : styles.gridItem
            }
            onClick={() => selectCallback(index)}
          >
            <div className={styles.colorBox} style={{backgroundColor: item}} />
          </button>
        ));

  return <div className={styles.pickerGrid}>{gridItems}</div>;
};

export default PickerGrid;
