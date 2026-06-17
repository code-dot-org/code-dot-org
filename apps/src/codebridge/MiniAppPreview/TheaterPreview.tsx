import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import React, {useMemo} from 'react';

import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import Theater from '@cdo/apps/miniApps/theater/Theater';
import TheaterVisualization from '@cdo/apps/miniApps/theater/TheaterVisualization';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './mini-app-preview.module.scss';

// Preview panel for the theater mini app.
const TheaterPreview: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  useMemo(() => {
    // The console manager may not exist when the theater is created, so look it
    // up lazily on each write rather than caching it.
    const onOutputMessage = (message: string) =>
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.writeConsoleMessage(message);
    const onNewlineMessage = () =>
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.writeConsoleMessage('');

    const theater = new Theater(onOutputMessage, onNewlineMessage, isRunning =>
      dispatch(setIsRunning(isRunning))
    );
    CodebridgeRegistry.getInstance().setTheater(theater);
    return theater;
  }, [dispatch]);

  return (
    <div className={moduleStyles.miniAppContainer}>
      <TheaterVisualization />
    </div>
  );
};

export default TheaterPreview;
