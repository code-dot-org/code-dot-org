import React from 'react';

import styles from './section-avatars.module.scss';

interface PickerGridProps {
  itemList: string[];
  type: 'emoji' | 'color';
}

const PickerGrid: React.FC<PickerGridProps> = ({itemList, type}) => {
  const gridItems =
    type === 'emoji'
      ? itemList.map((item, index) => (
          <div key={index} className={styles.gridItem}>
            {item}
          </div>
        ))
      : itemList.map((item, index) => (
          <div key={index} className={styles.gridItem}>
            <div className={styles.colorBox} style={{backgroundColor: item}} />
          </div>
        ));

  return <div className={styles.pickerGrid}>{gridItems}</div>;
};

export default PickerGrid;
