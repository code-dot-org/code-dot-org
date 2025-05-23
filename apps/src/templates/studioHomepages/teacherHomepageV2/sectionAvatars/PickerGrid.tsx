import classNames from 'classnames';
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
  const gridItem = (label: string, item: string, index: number) => {
    return (
      <div
        key={index}
        title={label}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={selected === index}
        className={
          selected === index
            ? classNames(styles.gridItem, styles.selectedGridItem)
            : styles.gridItem
        }
        onClick={() => selectCallback(index)}
        onKeyDown={event => {
          if (event.key === 'Enter') selectCallback(index);
        }}
      >
        {item.includes('#') ? (
          <div className={styles.colorBox} style={{backgroundColor: item}} />
        ) : (
          item
        )}
      </div>
    );
  };

  const gridItems =
    type === 'emoji'
      ? EMOJIS.map((item, index) => gridItem(EMOJI_LABELS[index], item, index))
      : COLORS.map((item, index) => gridItem(COLOR_LABELS[index], item, index));

  return <div className={styles.pickerGrid}>{gridItems}</div>;
};

export default PickerGrid;
