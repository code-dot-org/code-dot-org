import {Excalidraw, serializeAsJSON} from '@excalidraw/excalidraw';
import {ExcalidrawElement} from '@excalidraw/excalidraw/types/element/types';
import {AppState, BinaryFiles} from '@excalidraw/excalidraw/types/types';
import React, {useEffect, useCallback, useRef} from 'react';

import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {
  LabProps,
  LevelProperties,
  ProjectSources,
  SketchlabSource,
} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/sketchlab-view.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
const INITIAL_INFO_PANEL_WIDTH = 400;
const MIN_WORKSPACE_WIDTH = 400;
const INITIAL_WORKSPACE_WIDTH = 800;

const DEBOUNCED_WORKSPACE_SERIALIZATION_MS = 500;

const SketchlabView: React.FC<LabProps<LevelProperties>> = ({
  levelProperties,
}) => {
  const {currentSources, updateSources} = useSources<ProjectSources>();
  const saveSourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasRun = useAppSelector(state => state.lab2System.hasRun);

  const {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps: panelSeparatorProps,
    leftPanelDragging: isDragging,
    panelClassName,
  } = useVerticalLayout({
    leftPanel: {
      minWidth: MIN_INFO_PANEL_WIDTH,
      initialWidth: INITIAL_INFO_PANEL_WIDTH,
      name: 'instructions',
    },
    rightPanel: {
      minWidth: MIN_WORKSPACE_WIDTH,
      initialWidth: INITIAL_WORKSPACE_WIDTH,
      name: 'workspace',
    },
    appName: 'sketchlab',
  });

  // Excalidraw runs its onChange every time the cursor moves,
  // so we debounce actually serializing the workspace to stringified JSON.
  const debouncedSerializeAndSaveWorkspace = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      state: AppState,
      files: BinaryFiles
    ) => {
      if (saveSourcesTimeoutRef.current) {
        clearTimeout(saveSourcesTimeoutRef.current);
        saveSourcesTimeoutRef.current = null;
      }

      saveSourcesTimeoutRef.current = setTimeout(() => {
        const serializedData = JSON.parse(
          serializeAsJSON(elements, state, files, 'local')
        );
        updateSources({source: serializedData});
      }, DEBOUNCED_WORKSPACE_SERIALIZATION_MS);
    },
    [updateSources]
  );

  useEffect(() => {
    return () => {
      if (saveSourcesTimeoutRef.current) {
        clearTimeout(saveSourcesTimeoutRef.current);
      }
    };
  }, []);

  // Since there's no run button in Sketch Lab, set it to true by default
  // to enable the Submit button on edit on submittable levels.
  // Set back to false on unmount in case we switch to a different level type.
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setHasRun(true));

    return () => {
      dispatch(setHasRun(false));
    };
  }, [dispatch]);

  return (
    <div className={moduleStyles.sketchlabContainer}>
      <div style={{width: leftPanelWidth}} className={panelClassName}>
        <ResourcePanel
          levelProperties={levelProperties}
          isRunning={false}
          hasRun={hasRun}
          hasEdited={false}
        />
      </div>
      <ResizeBar
        isVertical={true}
        separatorProps={panelSeparatorProps}
        isDragging={isDragging}
      />
      <div style={{width: rightPanelWidth}}>
        <PanelContainer
          id="workspace"
          className={panelClassName}
          headerContent="Workspace"
        >
          <Excalidraw
            initialData={currentSources.source as SketchlabSource}
            onChange={debouncedSerializeAndSaveWorkspace}
          />
        </PanelContainer>
      </div>
    </div>
  );
};

export default (props: LabProps<LevelProperties>) => (
  <SourcesContainer {...props} defaultSources={{source: {}}}>
    <SketchlabView levelProperties={props.levelProperties} />
  </SourcesContainer>
);
