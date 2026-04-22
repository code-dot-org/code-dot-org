import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import {ReactFlowProvider} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, {useCallback, useEffect, useState} from 'react';

import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {LabProps, LevelProperties, ProjectSources} from '@cdo/apps/lab2/types';
import TeacherViewingStudentProjectAlert from '@cdo/apps/lab2/views/alerts/teacherViewingStudentProject';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import {useSources} from '@cdo/apps/lab2/views/SourcesContainer';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import ReactFlowCanvas from './components/ReactFlowCanvas';
import {ReactFlowSketchLabSources} from './types';

import styles from './react-flow-sketch-lab-view.module.scss';

export const REACT_FLOW_DEFAULT_SOURCES: ReactFlowSketchLabSources = {
  source: {nodes: [], edges: []},
};

const MIN_INFO_PANEL_WIDTH = 250;
const INITIAL_INFO_PANEL_WIDTH = 290;
const MIN_WORKSPACE_WIDTH = 400;
const INITIAL_WORKSPACE_WIDTH = 800;

function ReactFlowSketchLabViewInner({
  levelProperties,
}: LabProps<LevelProperties>) {
  const {
    currentSources,
    updateSources,
    setReinitializationHandler,
    showStartOverDialog,
  } = useSources<ReactFlowSketchLabSources>();

  const readonlyWorkspace = useAppSelector(isReadOnlyWorkspace);
  const hasRun = useAppSelector(state => state.lab2System.hasRun);
  const {theme} = useTheme();
  const colorMode = theme.toLowerCase() as 'light' | 'dark';

  // Remount the canvas to re-read sources, same pattern as Excalidraw's
  // key={excalidrawMountKey}.
  const [mountKey, setMountKey] = useState(0);
  const reinitializationHandler = useCallback(() => {
    setMountKey(key => key + 1);
  }, []);

  useEffect(() => {
    setReinitializationHandler(reinitializationHandler);
  }, [setReinitializationHandler, reinitializationHandler]);

  const onLoadVersion = useCallback(
    (sources: ProjectSources) => {
      if (sources) {
        updateSources(sources as ReactFlowSketchLabSources);
      }
      reinitializationHandler();
    },
    [updateSources, reinitializationHandler]
  );

  // Since there's no run button in Sketch Lab, set hasRun to true by default
  // to enable the Submit button on submittable levels.
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setHasRun(true));
    return () => {
      dispatch(setHasRun(false));
    };
  }, [dispatch]);

  const onClickStartOver = useCallback(() => {
    showStartOverDialog('custom', commonI18n.startOverGeneric());
  }, [showStartOverDialog]);

  const teacherViewingStudent = Boolean(
    useAppSelector(state => state.progress.viewAsUserId)
  );

  const WorkspaceAlert = useLevelEditMode<LevelProperties>(
    levelProperties.id,
    !!levelProperties.projectTemplateLevelName,
    useCallback(
      mode => {
        return {
          [mode === 'start' ? 'start_sources' : 'exemplar_sources']:
            currentSources,
        };
      },
      [currentSources]
    )
  );

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

  // Deep-clone so React Flow can mutate node style objects during resize.
  const source = currentSources.source;
  const hasValidNodes = Array.isArray(source?.nodes);
  const cloned = hasValidNodes ? structuredClone(source) : null;
  const initialNodes = cloned?.nodes ?? [];
  const initialEdges = cloned?.edges ?? [];
  const initialViewport = cloned?.viewport;

  return (
    <div className={styles.sketchlabContainer}>
      <div style={{width: leftPanelWidth}} className={panelClassName}>
        <ResourcePanel
          levelProperties={levelProperties}
          isRunning={false}
          hasRun={hasRun}
          hasEdited={false}
          settings={[useThemeSetting('sketchlab')]}
          versionHistoryProps={{
            startSources:
              (levelProperties?.startSources as ProjectSources) ||
              REACT_FLOW_DEFAULT_SOURCES,
            onLoadVersion,
          }}
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
          headerContent={<WorkspaceHeader />}
          rightHeaderContent={
            !readonlyWorkspace && (
              <MuiButton
                variant="outlined"
                color="tertiary"
                size="extraSmall"
                onClick={onClickStartOver}
                aria-label={commonI18n.startOver()}
                type="button"
                endIcon={
                  <FontAwesomeV6Icon
                    iconStyle="solid"
                    iconName="arrow-rotate-left"
                  />
                }
              >
                {commonI18n.startOver()}
              </MuiButton>
            )
          }
        >
          {teacherViewingStudent && (
            <TeacherViewingStudentProjectAlert inWorkspaceContainer />
          )}
          <ReactFlowCanvas
            key={mountKey}
            updateSources={updateSources}
            initialNodes={initialNodes}
            initialEdges={initialEdges}
            initialViewport={initialViewport}
            colorMode={colorMode}
            readOnly={readonlyWorkspace}
          />
          {WorkspaceAlert}
        </PanelContainer>
      </div>
    </div>
  );
}

export default function ReactFlowSketchLabView(
  props: LabProps<LevelProperties>
) {
  return (
    <ReactFlowProvider>
      <ReactFlowSketchLabViewInner {...props} />
    </ReactFlowProvider>
  );
}
