import classNames from 'classnames';
import React from 'react';

import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../codebridgeContext';
import Console from '../Console';
import ConsoleV2 from '../Console/ConsoleV2';
import MiniAppPreview from '../MiniAppPreview/MiniAppPreview';

import moduleStyles from './output.module.scss';

const Output: React.FunctionComponent = () => {
  const miniApp = useAppSelector(state => state.lab.levelProperties?.miniApp);
  const {config} = useCodebridgeContext();
  const isVertical = config.activeGridLayout === 'vertical';
  const consoleExperimentEnabled = experiments.isEnabled(
    experiments.PYTHONLAB_XTERM
  );
  const ConsoleComponent = consoleExperimentEnabled ? ConsoleV2 : Console;
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
      <MiniAppPreview />
      <ConsoleComponent />
    </div>
  );
};

export default Output;
