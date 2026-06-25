import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import React, {useEffect} from 'react';

import Theater from '@cdo/apps/miniApps/theater/Theater';
import TheaterVisualization from '@cdo/apps/miniApps/theater/TheaterVisualization';

import moduleStyles from './mini-app-preview.module.scss';

// Preview panel for the theater mini app.
const TheaterPreview: React.FunctionComponent = () => {
  useEffect(() => {
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

    const theater = new Theater(
      onOutputMessage,
      onNewlineMessage,
      // TODO: actually handle prompter
      () => onOutputMessage(`[JAVALAB] Photo prompts are not yet supported.`),
      () => {},
      () => {}
    );
    CodebridgeRegistry.getInstance().setTheater(theater);

    // Drop the registry's reference on unmount; otherwise a later
    // stopJavaCode() calls onStop() on this theater after its DOM is gone.
    return () => CodebridgeRegistry.getInstance().setTheater(null);
  }, []);

  return (
    <div className={moduleStyles.miniAppContainer}>
      <TheaterVisualization />
    </div>
  );
};

export default TheaterPreview;
