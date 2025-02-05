import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import MiniAppPreview from '@codebridge/MiniAppPreview/MiniAppPreview';
import classNames from 'classnames';
import React from 'react';

import Console from '@cdo/apps/codebridge/Console/Console';

import moduleStyles from './output.module.scss';

const Output: React.FunctionComponent = () => {
  const {config, labConfig} = useCodebridgeContext();
  const isVertical = config.activeGridLayout === 'vertical';
  const miniApp = labConfig?.miniApp?.name;
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
