import React from 'react';

import GenerateImagePane from './GenerateImagePane';

import moduleStyles from './sprite-lab2-view.module.scss';

/**
 * The Items tab. SpriteLab2 manages its images entirely through AI image
 * generation: the generate pane creates sprites/backgrounds and the gallery
 * below it is how you view and delete them. (The classic Piskel editor and the
 * premade animation library are intentionally not used here.)
 */
const ItemsTab: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.itemsTab}>
      <GenerateImagePane />
    </div>
  );
};

export default ItemsTab;
