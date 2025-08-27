import React from 'react';
import ReactBodymovin from 'react-bodymovin/lib/ReactBodymovinFull';

import styles from './Dancer.module.scss';

var bodymovinOptions = {
  loop: true,
  autoplay: true,
  prerender: true,
  //animationData: dancerAnimation
  path: '/assets/Dancer_DoubleJam_greys.json',
};

export default class Dancer extends React.Component {
  render = () => {
    return (
      <div className={styles.dancerContainer}>
        <ReactBodymovin options={bodymovinOptions} />
      </div>
    );
  };
}
