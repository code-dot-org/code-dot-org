import Console from '@codebridge/Console';
import classNames from 'classnames';
import React from 'react';

import MiniAppPreview from '@cdo/apps/codebridge/MiniAppPreview/MiniAppPreview';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './output.module.scss';

const Output: React.FunctionComponent = () => {
  const miniApp = useAppSelector(state => state.lab.levelProperties?.miniApp);
  const {config} = useCodebridgeContext();
  const isVertical = config.activeGridLayout === 'vertical';
  if (!miniApp) {
    return (
      <div className={moduleStyles.outputContainer}>
        <Console />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        moduleStyles.outputContainer,
        isVertical ? moduleStyles.vertical : moduleStyles.horizontal
      )}
    >
      <MiniAppPreview />
      <Console />
    </div>
  );
};

export default Output;
