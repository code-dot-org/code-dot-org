import React from 'react';

import styles from './section-avatars.module.scss';

interface PickerGridProps {
  itemList: string[];
  type: 'emoji' | 'color';
  selectCallback: (index: number) => void;
  selected: number;
}

const PickerGrid: React.FC<PickerGridProps> = ({
  itemList,
  type,
  selectCallback,
  selected,
}) => {
  const gridItems =
    type === 'emoji'
      ? itemList.map((item, index) => (
          <div
            key={index}
            className={
              selected === index ? styles.selectedGridItem : styles.gridItem
            }
            onClick={() => selectCallback(index)}
          >
            {item}
          </div>
        ))
      : itemList.map((item, index) => (
          <div
            key={index}
            className={
              selected === index ? styles.selectedGridItem : styles.gridItem
            }
            onClick={() => selectCallback(index)}
          >
            <div className={styles.colorBox} style={{backgroundColor: item}} />
          </div>
        ));

  return <div className={styles.pickerGrid}>{gridItems}</div>;
};

export default PickerGrid;
