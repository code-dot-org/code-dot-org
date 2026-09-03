import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {getSystemError} from '@codebridge/Console/MessageHelpers';
import React, {useCallback, useEffect, useState} from 'react';

import Theater from '@cdo/apps/miniApps/theater/Theater';
import TheaterVisualization from '@cdo/apps/miniApps/theater/TheaterVisualization';

import MiniAppEmptyState from './MiniAppEmptyState';
import PhotoPrompterButton from './PhotoPrompterButton';

import moduleStyles from './mini-app-preview.module.scss';

interface TheaterPreviewProps {
  isOutputVisible: boolean;
  setIsOutputVisible: (isVisible: boolean) => void;
}

// Preview panel for the theater mini app.
const TheaterPreview: React.FunctionComponent<TheaterPreviewProps> = ({
  isOutputVisible,
  setIsOutputVisible,
}) => {
  const {sendTypedInputMessage, levelProperties} = useCodebridgeContext();
  const appName = levelProperties?.appName;
  const [isPrompterOpen, setIsPrompterOpen] = useState(false);
  const [promptText, setPromptText] = useState('');

  const onMediaLoadError = useCallback(
    (type: 'video' | 'audio') => {
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.writeConsoleMessage(
          getSystemError(`Could not load the theater ${type}.`, appName)
        );
    },
    [appName]
  );

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

    // Ensure the theater is stopped and reset to avoid leaks.
    // Drop the registry's reference on unmount; otherwise a later
    // stop could call onStop() on this theater after its DOM is gone.
    return () => {
      theater.onStop();
      theater.reset();
      CodebridgeRegistry.getInstance().setTheater(null);
    };
  }, [sendTypedInputMessage, onMediaLoadError, setIsOutputVisible]);

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
