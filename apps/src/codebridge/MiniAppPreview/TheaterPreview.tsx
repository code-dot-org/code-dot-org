import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import React, {useEffect, useState} from 'react';

import {sendTheaterInput} from '@cdo/apps/javalab/lab2/javabuilderRunUtils';
import Theater from '@cdo/apps/miniApps/theater/Theater';
import TheaterVisualization from '@cdo/apps/miniApps/theater/TheaterVisualization';

import PhotoPrompterButton from './PhotoPrompterButton';

import moduleStyles from './mini-app-preview.module.scss';

// Preview panel for the theater mini app.
const TheaterPreview: React.FunctionComponent = () => {
  const [isPrompterOpen, setIsPrompterOpen] = useState(false);
  const [promptText, setPromptText] = useState('');

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
      (prompt?: string) => {
        setPromptText(prompt ?? '');
        setIsPrompterOpen(true);
      },
      () => setIsPrompterOpen(false),
      sendTheaterInput
    );
    CodebridgeRegistry.getInstance().setTheater(theater);

    // Drop the registry's reference on unmount; otherwise a later
    // stopJavaCode() calls onStop() on this theater after its DOM is gone.
    return () => CodebridgeRegistry.getInstance().setTheater(null);
  }, []);

  const onPhotoSelected = (file: File) => {
    CodebridgeRegistry.getInstance()
      .getTheater()
      ?.onPhotoPrompterFileSelected(file);
    setIsPrompterOpen(false);
  };

  return (
    <div className={moduleStyles.miniAppContainer}>
      <TheaterVisualization />
      {isPrompterOpen && (
        <PhotoPrompterButton
          promptText={promptText}
          onPhotoSelected={onPhotoSelected}
        />
      )}
    </div>
  );
};

export default TheaterPreview;
