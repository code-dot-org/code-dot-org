import PropTypes from 'prop-types';
import React from 'react';
import ReactBodymovin from 'react-bodymovin/lib/ReactBodymovinFull';

import styles from './Dancer.module.scss';

export const baseAssetUrl =
  'https://curriculum.code.org/media/musiclab/hoai2025/dancers/';

export default class Dancer extends React.Component {
  static propTypes = {
    dancerId: PropTypes.string,
  };

  render = () => {
    var bodymovinOptions = {
      loop: true,
      autoplay: true,
      prerender: true,
      //animationData: dancerAnimation
      path: baseAssetUrl + this.props.dancerId + '.json',
    };

    return (
      <div className={styles.dancerContainer}>
        <ReactBodymovin options={bodymovinOptions} />
      </div>
    );
  };
}
