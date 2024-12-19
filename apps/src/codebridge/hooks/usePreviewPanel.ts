import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

export const usePreviewPanel = () => {
  const miniApp = useAppSelector(state => state.lab.levelProperties?.miniApp);
  const images = useAppSelector(state => state.codebridgeConsole.images);
  const consoleExperimentEnabled = experiments.isEnabled(
    experiments.PYTHONLAB_XTERM
  );
  const showPreviewPanel =
    miniApp || (consoleExperimentEnabled && images.length > 0);

  return {showPreviewPanel};
};
