import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import Console from '@codebridge/Console';
import ConsoleV2 from '@codebridge/Console/ConsoleV2';
import MiniAppPreview from '@codebridge/MiniAppPreview/MiniAppPreview';
import classNames from 'classnames';
import React from 'react';

import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

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
