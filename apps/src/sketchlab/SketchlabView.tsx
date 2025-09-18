import {Excalidraw, serializeAsJSON} from '@excalidraw/excalidraw';
import {ExcalidrawImperativeAPI} from '@excalidraw/excalidraw/types/types';
import React, {useEffect, useState} from 'react';

import {useTwoColumnLayout} from '@cdo/apps/lab2/hooks/useTwoColumnLayout';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';

import moduleStyles from './styles/sketchlab-view.module.scss';

const getInitialData = () => {
  const savedData = localStorage.getItem('sketch-data');
  return savedData ? JSON.parse(savedData) : null;
};

const SketchlabView: React.FunctionComponent = () => {
  const [excalidrawApi, setExcalidrawApi] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    isDragging,
    panelClassName,
  } = useTwoColumnLayout({
    leftPanel: {minWidth: 200, initialWidth: 200, name: 'instructions'},
    rightPanel: {minWidth: 400, initialWidth: 600, name: 'workspace'},
    appName: 'sketchlab',
  });

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
        localStorage.setItem('sketch-data', serializedData);
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
    <div className={moduleStyles.sketchlabContainer}>
      <div style={{width: leftPanelWidth}} className={panelClassName}>
        instructions
      </div>
      <ResizeBar
        isVertical={true}
        separatorProps={leftPanelSeparatorProps}
        isDragging={isDragging}
      />
      <div style={{width: rightPanelWidth}} className={panelClassName}>
        <Excalidraw
          excalidrawAPI={api => setExcalidrawApi(api)}
          initialData={getInitialData()}
        />
      </div>
    </div>
  );
};

export default SketchlabView;
