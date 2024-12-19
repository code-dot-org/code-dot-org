import classNames from 'classnames';
import React from 'react';

import OutputPreview from '@cdo/apps/codebridge/OutputPreview/OutputPreview';
import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../codebridgeContext';
import Console from '../Console';
import ConsoleV2 from '../Console/ConsoleV2';

import moduleStyles from './output.module.scss';

const Output: React.FunctionComponent = () => {
  const miniApp = useAppSelector(state => state.lab.levelProperties?.miniApp);
  const {config} = useCodebridgeContext();
  const isVertical = config.activeGridLayout === 'vertical';
  const ConsoleComponent = experiments.isEnabled(experiments.PYTHONLAB_XTERM)
    ? ConsoleV2
    : Console;
  if (!miniApp) {
    return (
      <div className={moduleStyles.outputContainer}>
        <ConsoleComponent />
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
      <OutputPreview />
      <ConsoleComponent />
    </div>
  );
};

export default Output;
