import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {getSystemError} from '@codebridge/Console/MessageHelpers';
import React, {useCallback, useEffect, useState} from 'react';

import {setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import Theater from '@cdo/apps/miniApps/theater/Theater';
import TheaterVisualization from '@cdo/apps/miniApps/theater/TheaterVisualization';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import MiniAppEmptyState from './MiniAppEmptyState';
import PhotoPrompterButton from './PhotoPrompterButton';

import moduleStyles from './mini-app-preview.module.scss';

// Preview panel for the theater mini app.
const TheaterPreview: React.FunctionComponent = () => {
  const {sendTypedInputMessage, levelProperties} = useCodebridgeContext();
  const appName = levelProperties?.appName;
  const dispatch = useAppDispatch();
  const [isPrompterOpen, setIsPrompterOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isOutputVisible, setIsOutputVisible] = useState(false);

  // The theater has already put itself back; report the failure and release the
  // run button, which a theater run otherwise leaves showing stop.
  const onMediaLoadError = useCallback(() => {
    CodebridgeRegistry.getInstance()
      .getConsoleManager()
      ?.writeConsoleMessage(
        getSystemError('Could not display the video.', appName)
      );
    dispatch(setIsRunning(false));
  }, [appName, dispatch]);

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
      sendTypedInputMessage ?? (() => {}),
      setIsOutputVisible,
      onMediaLoadError
    );
    CodebridgeRegistry.getInstance().setTheater(theater);

    // Ensure any running program is stopped and the theater is reset
    // to avoid leaks.
    // Drop the registry's reference on unmount; otherwise a later
    // stop could call onStop() on this theater after its DOM is gone.
    return () => {
      theater.onStop();
      theater.reset();
      CodebridgeRegistry.getInstance().setTheater(null);
    };
  }, [sendTypedInputMessage, onMediaLoadError]);

  const onPhotoSelected = (file: File) => {
    CodebridgeRegistry.getInstance()
      .getTheater()
      ?.onPhotoPrompterFileSelected(file);
    setIsPrompterOpen(false);
  };

  return (
    <div className={moduleStyles.miniAppContainer}>
      <TheaterVisualization />
      {!isOutputVisible && !isPrompterOpen && (
        <MiniAppEmptyState
          iconName="camera-movie"
          title="Nothing playing yet"
          description="Press Run to see your code in action."
        />
      )}
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
