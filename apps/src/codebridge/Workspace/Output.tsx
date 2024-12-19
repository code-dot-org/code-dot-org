import classNames from 'classnames';
import React from 'react';

import OutputPreview from '@cdo/apps/codebridge/OutputPreview/OutputPreview';
import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../codebridgeContext';
import Console from '../Console';
import ConsoleV2 from '../Console/ConsoleV2';
import ImagePreview from '../OutputPreview/ImagePreview';

import moduleStyles from './output.module.scss';

const Output: React.FunctionComponent = () => {
  const miniApp = useAppSelector(state => state.lab.levelProperties?.miniApp);
  const images = useAppSelector(state => state.codebridgeConsole.images);
  const {config} = useCodebridgeContext();
  const isVertical = config.activeGridLayout === 'vertical';
  const consoleExperimentEnabled = experiments.isEnabled(
    experiments.PYTHONLAB_XTERM
  );
  const ConsoleComponent = consoleExperimentEnabled ? ConsoleV2 : Console;
  if (!miniApp && (!consoleExperimentEnabled || images.length === 0)) {
    return (
      <div className={moduleStyles.outputContainer}>
        <ConsoleComponent />
      </div>
    );
  }

  const innerPreviewComponent = images.length > 0 ? <ImagePreview /> : null;

  return (
    <div
      className={classNames(
        moduleStyles.outputContainer,
        isVertical ? moduleStyles.vertical : moduleStyles.horizontal
      )}
    >
      <OutputPreview innerComponent={innerPreviewComponent} />
      <ConsoleComponent />
    </div>
  );
};

export default Output;
