// Theater mini-app preview. Renders the image/audio surface plus an overlay
// photo prompter when Javabuilder asks for one.
//
// Lifetime: the Theater controller is constructed once and registered with
// CodebridgeRegistry so the javabuilder runner can deliver THEATER signals
// without going through React. Refs to the <img>/<audio> elements are
// handed to the controller via the hooks object.
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import PhotoPrompter from '@cdo/apps/javalab2/miniApps/PhotoPrompter';
import Theater from '@cdo/apps/javalab2/miniApps/Theater';
import {TheaterInputMessage} from '@cdo/apps/javalab2/miniApps/theaterConstants';
import {sendTheaterInput} from '@cdo/apps/javalab2/javabuilderRunner';

import moduleStyles from './theater-preview.module.scss';

interface PrompterState {
  prompt: string;
  uploadUrl: string;
}

const TheaterPreview: React.FunctionComponent = () => {
  const imgRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [prompter, setPrompter] = useState<PrompterState | null>(null);

  const openPrompter = useCallback((prompt: string, uploadUrl: string) => {
    setPrompter({prompt, uploadUrl});
  }, []);
  const closePrompter = useCallback(() => setPrompter(null), []);
  const onProgramCompleted = useCallback(() => {
    // The console message is owned by javabuilderRunner; nothing to do here
    // beyond clearing transient UI state.
    setPrompter(null);
  }, []);

  const theater = useMemo(
    () =>
      new Theater({
        getImg: () => imgRef.current,
        getAudio: () => audioRef.current,
        openPrompter,
        closePrompter,
        onProgramCompleted,
      }),
    [openPrompter, closePrompter, onProgramCompleted]
  );

  useEffect(() => {
    CodebridgeRegistry.getInstance().setTheater(theater);
    return () => {
      CodebridgeRegistry.getInstance().setTheater(null);
    };
  }, [theater]);

  const onPrompterResult = useCallback((success: boolean) => {
    sendTheaterInput(
      success
        ? TheaterInputMessage.UPLOAD_SUCCESS
        : TheaterInputMessage.UPLOAD_ERROR
    );
    setPrompter(null);
  }, []);

  return (
    <div className={moduleStyles.container}>
      <img ref={imgRef} className={moduleStyles.image} alt="" />
      {/* Audio is generated dynamically from student code, no caption needed. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="auto" />
      {prompter && (
        <PhotoPrompter
          prompt={prompter.prompt}
          uploadUrl={prompter.uploadUrl}
          onResult={onPrompterResult}
        />
      )}
    </div>
  );
};

export default TheaterPreview;
