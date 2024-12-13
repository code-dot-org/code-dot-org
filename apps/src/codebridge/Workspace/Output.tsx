import Console from '@codebridge/Console';
import Preview from '@codebridge/Preview/Preview';
import classNames from 'classnames';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './workspace.module.scss';

const Output: React.FunctionComponent = () => {
  const miniApp = useAppSelector(state => state.lab.levelProperties?.miniApp);
  const {config} = useCodebridgeContext();
  const isVertical = config.activeGridLayout === 'vertical';
  if (!miniApp) {
    return <Console />;
  }

  return (
    <div
      className={classNames(
        moduleStyles.outputContainer,
        isVertical ? moduleStyles.vertical : moduleStyles.horizontal
      )}
    >
      <Preview />
      <Console />
    </div>
  );
};

export default Output;
