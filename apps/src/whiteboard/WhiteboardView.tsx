import {Excalidraw, serializeAsJSON} from '@excalidraw/excalidraw';
import {ExcalidrawImperativeAPI} from '@excalidraw/excalidraw/types/types';
import React, {useEffect, useState} from 'react';

import moduleStyles from './styles/whiteboard-view.module.scss';

const getInitialData = () => {
  const savedData = localStorage.getItem('whiteboard-data');
  return savedData ? JSON.parse(savedData) : null;
};

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
      <Excalidraw
        excalidrawAPI={api => setExcalidrawApi(api)}
        initialData={getInitialData()}
      />
    </div>
  );
};

export default WhiteboardView;
