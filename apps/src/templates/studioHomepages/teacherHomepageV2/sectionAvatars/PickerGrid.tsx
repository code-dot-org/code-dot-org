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
  const gridItems =
    type === 'emoji'
      ? EMOJIS.map((item, index) => (
          <div
            key={index}
            title={EMOJI_LABELS[index]}
            role="button"
            tabIndex={0}
            aria-label={EMOJI_LABELS[index]}
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
            {item}
          </div>
        ))
      : COLORS.map((item, index) => (
          <div
            key={index}
            title={COLOR_LABELS[index]}
            role="button"
            tabIndex={0}
            aria-label={COLOR_LABELS[index]}
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
            <div className={styles.colorBox} style={{backgroundColor: item}} />
          </div>
        ));

  return <div className={styles.pickerGrid}>{gridItems}</div>;
};

export default PickerGrid;
