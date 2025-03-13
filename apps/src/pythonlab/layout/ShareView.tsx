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

const SIDEBAR_WIDTH = 150;
const MIN_PREVIEW_WIDTH = 200;

const ShareView: React.FunctionComponent = () => {
  const miniApp = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  const onViewCode = () => {
    projectManager?.redirectToView();
  };

  const onRemix = () => {
    projectManager?.redirectToRemix();
  };
  const [consoleVisible, setConsoleVisible] = useState(false);

  const showPreview = hasPreview(miniApp);

  const getAvailablePreviewWidth = () => {
    return Math.max(window.innerWidth - SIDEBAR_WIDTH, MIN_PREVIEW_WIDTH);
  };

  const [previewWidth, setPreviewWidth] = useState(getAvailablePreviewWidth());
  const [previewHeight, setPreviewHeight] = useState(window.innerHeight);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setPreviewWidth(getAvailablePreviewWidth());
      setPreviewHeight(window.innerHeight);
    });
    return () =>
      window.removeEventListener('resize', () => {
        setPreviewWidth(getAvailablePreviewWidth());
        setPreviewHeight(window.innerHeight);
      });
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
      <div
        className={moduleStyles.previewContainer}
        style={{width: previewWidth, height: previewHeight}}
      >
        {showPreview ? (
          <ConsoleAndPreviewShare
            consoleVisible={consoleVisible}
            height={previewHeight}
            width={previewWidth}
          />
        ) : (
          <ConsoleShare />
        )}
      </div>
    </div>
  );
};

export default ShareView;
