import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {CodebridgeEmptyState} from '@codebridge/components/CodebridgeEmptyState';
import React, {useEffect, useState} from 'react';

import Theater from '@cdo/apps/miniApps/theater/Theater';
import TheaterVisualization from '@cdo/apps/miniApps/theater/TheaterVisualization';

import PhotoPrompterButton from './PhotoPrompterButton';

import moduleStyles from './mini-app-preview.module.scss';

// Preview panel for the theater mini app.
const TheaterPreview: React.FunctionComponent = () => {
  const {sendTypedInputMessage} = useCodebridgeContext();
  const [isPrompterOpen, setIsPrompterOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isOutputVisible, setIsOutputVisible] = useState(false);

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
      setIsOutputVisible
    );
    CodebridgeRegistry.getInstance().setTheater(theater);

    // Drop the registry's reference on unmount; otherwise a later
    // stopJavaCode() calls onStop() on this theater after its DOM is gone.
    return () => CodebridgeRegistry.getInstance().setTheater(null);
  }, [sendTypedInputMessage]);

  const onPhotoSelected = (file: File) => {
    CodebridgeRegistry.getInstance()
      .getTheater()
      ?.onPhotoPrompterFileSelected(file);
    setIsPrompterOpen(false);
  };

  return (
    <div className={moduleStyles.miniAppContainer}>
      <TheaterVisualization />
      {/* The prompter is centered in the same space, so it takes over. */}
      {!isOutputVisible && !isPrompterOpen && (
        <CodebridgeEmptyState
          className={moduleStyles.miniAppEmptyState}
          iconProps={{iconName: 'camera-movie'}}
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
