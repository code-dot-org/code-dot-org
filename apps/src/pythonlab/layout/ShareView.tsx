import Button from '@code-dot-org/component-library/button';
import Toggle from '@code-dot-org/component-library/toggle';
import React, {useEffect, useState} from 'react';

import {hasPreview} from '@cdo/apps/codebridge';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import pythonlabI18n from '@cdo/apps/pythonlab/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import ConsoleAndPreviewShare from './ConsoleAndPreviewShare';
import ConsoleShare from './ConsoleShare';

import moduleStyles from './share-view.module.scss';

const ShareView: React.FunctionComponent = () => {
  const miniApp = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );
  const getAvailableOutputWidth = () => {
    return Math.max(window.innerWidth - 172, 400);
  };

  const [outputWidth, setOutputWidth] = useState(getAvailableOutputWidth());
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  const onViewCode = () => {
    projectManager?.redirectToView();
  };

  const onRemix = () => {
    projectManager?.redirectToRemix();
  };
  const [consoleVisible, setConsoleVisible] = useState(false);

  const showPreview = hasPreview(miniApp);

  useEffect(() => {
    window.addEventListener('resize', () =>
      setOutputWidth(getAvailableOutputWidth())
    );
    return () =>
      window.removeEventListener('resize', () =>
        setOutputWidth(getAvailableOutputWidth())
      );
  }, []);

  return (
    <div className={moduleStyles.shareContainer}>
      <div className={moduleStyles.sidebar} data-theme="Dark">
        {showPreview && (
          <div className={moduleStyles.consoleToggle}>
            <Toggle
              checked={consoleVisible}
              onChange={e => setConsoleVisible(e.target.checked)}
              name={pythonlabI18n.changeConsoleVisibility()}
              label={pythonlabI18n.console()}
              position={'right'}
              size={'xs'}
            />
          </div>
        )}
        <Button
          text={commonI18n.viewCode()}
          type="tertiary"
          color="black"
          size="xs"
          iconLeft={{iconStyle: 'solid', iconName: 'code'}}
          onClick={onViewCode}
        />
        <Button
          text={commonI18n.makeMyOwn()}
          type="tertiary"
          color="black"
          size="xs"
          iconLeft={{iconStyle: 'regular', iconName: 'pen-to-square'}}
          onClick={onRemix}
        />
      </div>
      {showPreview ? (
        <ConsoleAndPreviewShare
          consoleVisible={consoleVisible}
          availableWidth={outputWidth}
        />
      ) : (
        <ConsoleShare />
      )}
    </div>
  );
};

export default ShareView;
