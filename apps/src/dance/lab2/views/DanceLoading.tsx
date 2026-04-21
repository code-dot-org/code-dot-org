import classNames from 'classnames';
import React from 'react';

import loadingGif from '@cdo/static/dance/DancePartyLoading.gif';

import danceI18n from '../locale';

import moduleStyles from './dance-view.module.scss';

const DanceLoading: React.FC<{isLoading: boolean}> = ({isLoading}) => (
  <div
    className={classNames(
      moduleStyles.loading,
      isLoading && moduleStyles.loadingShow
    )}
  >
    <img
      src={loadingGif}
      className={moduleStyles.loadingGif}
      alt={danceI18n.dancePartyLoading()}
    />
  </div>
);

export default DanceLoading;
