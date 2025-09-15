import {Excalidraw, serializeAsJSON} from '@excalidraw/excalidraw';
import {ExcalidrawImperativeAPI} from '@excalidraw/excalidraw/types/types';
import React, {useEffect, useState} from 'react';

import moduleStyles from './styles/whiteboard-view.module.scss';

const getInitialData = () => {
  const savedData = localStorage.getItem('whiteboard-data');
  return savedData ? JSON.parse(savedData) : null;
};

// IMMINENT TO DO: make sure we're on latest release.

// TO DO: Excalidraw's hamburger dropdown menu never shows up because
// it has a class "dropdown-menu", which is hidden by our global stylesheet.
// TO DO: hook storage into Project system.
// TO DO: add Instructions panel, render inside Workspace.
// TO DO: noticed font intermittently not read from local storage correctly?
// TO DO: add levelbuilder instructions support
const WhiteboardView: React.FunctionComponent = () => {
  const [excalidrawApi, setExcalidrawApi] =
    useState<ExcalidrawImperativeAPI | null>(null);

  // Serialize Excalidraw canvas to localStorage when navigating away
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (excalidrawApi) {
        const elements = excalidrawApi.getSceneElements();
        const appState = excalidrawApi.getAppState();
        const serializedData = serializeAsJSON(
          elements,
          appState,
          excalidrawApi.getFiles(),
          'local'
        );
        localStorage.setItem('whiteboard-data', serializedData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    const autoSaveInterval = setInterval(handleBeforeUnload, 30000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(autoSaveInterval);
    };
  }, [excalidrawApi]);

  return (
    <div className={moduleStyles.whiteboardContainer}>
      <div className={moduleStyles.whiteboardCanvas}>
        <Excalidraw
          excalidrawAPI={api => setExcalidrawApi(api)}
          initialData={getInitialData()}
        />
      </div>
    </div>
  );
};

export default WhiteboardView;
