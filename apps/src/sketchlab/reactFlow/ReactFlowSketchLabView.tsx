import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import {ReactFlowProvider, useReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {SUPPORTED_IMAGE_EXTENSIONS} from '@cdo/apps/lab2/constants';
import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {
  ExcalidrawSourceWithExternalFiles,
  LabProps,
  LevelProperties,
  ProjectSources,
  SketchlabReactFlowSource,
} from '@cdo/apps/lab2/types';
import WorkspaceAlerts from '@cdo/apps/lab2/views/alerts/workspaceAlerts';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {WorkspaceHeader} from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import {useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import {useSources} from '@cdo/apps/lab2/views/SourcesContainer';
import {BackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import ReactFlowCanvas from './components/ReactFlowCanvas';
import useReactFlowSketchLabTour from './introTour/useReactFlowSketchLabTour';
import ShareView from './ShareView';
import {ImageNodeData, ReactFlowSketchLabSources} from './types';
import {
  convertExcalidrawToReactFlow,
  uploadConvertedDataUrlImages,
} from './utils/convertExcalidrawSources';
import {makeBackpackImageImportHandler} from './utils/handleBackpackImageImport';
import {handleDownloadSketch} from './utils/handleDownloadSketch';
import {handleSaveToBackpack} from './utils/handleSaveToBackpack';
import {migrateTriangleHandleIds} from './utils/migrateReactFlowSources';

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
  const isResourcePanelCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  const isShareView = useAppSelector(state => state.lab.isShareView);
  const themeSetting = useThemeSetting('sketchlab');

  useReactFlowSketchLabTour({levelProperties, enabled: !isShareView});

  const hasRun = useAppSelector(state => state.lab2System.hasRun);
  const {theme} = useTheme();
  const colorMode = theme.toLowerCase() as 'light' | 'dark';

  const reactFlow = useReactFlow();
  const dialogControl = useDialogControl();
  // A Backpack image the user asked to import. The canvas watches this prop and
  // adds it as a node (reusing its placement, undo, and focus behavior), then
  // clears it via onImageImportConsumed.
  const [pendingImageImport, setPendingImageImport] =
    useState<ImageNodeData | null>(null);
  const clearPendingImageImport = useCallback(
    () => setPendingImageImport(null),
    []
  );
  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const channelId = useAppSelector(state => state.lab.channel?.id) ?? '';
  // The Backpack API redirects to sign-in for signed-out users, so we only
  // create an instance when we have a user.
  const backpackContext = useMemo(
    () =>
      currentUserId
        ? {
            primaryApi: new BackpackClientApi('sketchlab', null),
            secondaryApis: {aichat: new BackpackClientApi('aichat', null)},
          }
        : null,
    [currentUserId]
  );

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
  const onClickDownload = useCallback(() => {
    void handleDownloadSketch(reactFlow, dialogControl);
  }, [reactFlow, dialogControl]);

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

  const backpackProps = useMemo(
    () => ({
      validateFileName: (fileName: string) => ({
        isSupportFileName: false,
        newFileName: fileName,
      }),
      // Importing goes through addFileHandler below, so these callbacks are
      // no-ops.
      saveFileToProject: () => {},
      createNewProjectFile: () => {},
      findIdForFileName: () => undefined,
      saveToBackpackButton: {
        onClick: (fileList: string[], errorCallback: (error: string) => void) =>
          handleSaveToBackpack(
            reactFlow,
            backpackContext?.primaryApi,
            dialogControl,
            fileList,
            errorCallback
          ),
        text: 'Save Sketch to Backpack',
      },
      supportedFileTypes: SUPPORTED_IMAGE_EXTENSIONS,
      addFileTooltipText: 'Add to sketch',
      addFileHandler: makeBackpackImageImportHandler({
        levelName: levelProperties.name,
        channelId,
        addImageNode: (data: ImageNodeData) => setPendingImageImport(data),
      }),
    }),
    [reactFlow, backpackContext, dialogControl, channelId, levelProperties.name]
  );

  // Read sources, converting from Excalidraw if this project was last
  // saved by the old lab. Migrates stale triangle handle IDs from prior
  // renames. Deep-clone so React Flow can mutate node style objects during resize.
  const {initialNodes, initialEdges, initialViewport, convertedFromExcalidraw} =
    useMemo(() => {
      const source = currentSources.source as
        | SketchlabReactFlowSource
        | ExcalidrawSourceWithExternalFiles
        | undefined;
      let normalized: SketchlabReactFlowSource | null = null;
      let didConvert = false;
      if (source && (source as {type?: string}).type === 'excalidraw') {
        normalized = convertExcalidrawToReactFlow(
          source as ExcalidrawSourceWithExternalFiles
        );
        didConvert = true;
      } else if (Array.isArray((source as SketchlabReactFlowSource)?.nodes)) {
        normalized = source as SketchlabReactFlowSource;
      }
      // TODO: once all start sources and student projects have been audited and
      // confirmed free of stale triangle handle IDs, remove this migration call
      // and delete migrateReactFlowSources.ts.
      if (normalized) {
        normalized = migrateTriangleHandleIds(normalized);
      }
      const cloned = normalized ? structuredClone(normalized) : null;
      return {
        initialNodes: cloned?.nodes ?? [],
        initialEdges: cloned?.edges ?? [],
        initialViewport: cloned?.viewport,
        convertedFromExcalidraw: didConvert,
      };
    }, [currentSources.source]);

  // Only after a fresh Excalidraw conversion, upload any ImageNode
  // whose src is still a base64 dataURL — these can come from old
  // start sources or exemplar sources. The canvas's debounced save
  // then persists the resulting asset URLs instead of base64. We
  // don't run this for native React Flow sources, as they never use base64.
  useEffect(() => {
    if (!convertedFromExcalidraw || readonlyWorkspace) return;
    uploadConvertedDataUrlImages(reactFlow, channelId, levelProperties.name);
  }, [
    convertedFromExcalidraw,
    reactFlow,
    channelId,
    levelProperties.name,
    readonlyWorkspace,
  ]);

  if (isShareView) {
    return (
      <ShareView
        levelName={levelProperties.name}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        initialViewport={initialViewport}
        colorMode={colorMode}
      />
    );
  }

  return (
    <BackpackAPIContext.Provider value={backpackContext}>
      <div className={styles.sketchlabContainer}>
        <div
          style={isResourcePanelCollapsed ? undefined : {width: leftPanelWidth}}
          className={classNames(
            panelClassName,
            isResourcePanelCollapsed && styles.collapsedPanel
          )}
        >
          <ResourcePanel
            levelProperties={levelProperties}
            isRunning={false}
            hasRun={hasRun}
            hasEdited={false}
            settings={[themeSetting]}
            versionHistoryProps={{
              startSources:
                (levelProperties?.templateSources as ProjectSources) ||
                (levelProperties?.startSources as ProjectSources) ||
                REACT_FLOW_DEFAULT_SOURCES,
              onLoadVersion,
            }}
            backpackProps={backpackProps}
          />
        </div>
        {!isResourcePanelCollapsed && (
          <ResizeBar
            isVertical={true}
            separatorProps={panelSeparatorProps}
            isDragging={isDragging}
          />
        )}
        <div
          style={
            isResourcePanelCollapsed ? {flex: 1} : {width: rightPanelWidth}
          }
        >
          <PanelContainer
            id="workspace"
            className={panelClassName}
            headerContent={<WorkspaceHeader.Content />}
            leftHeaderContent={
              <MuiButton
                variant="outlined"
                color="tertiary"
                size="extraSmall"
                onClick={onClickDownload}
                aria-label="Download"
                type="button"
                startIcon={
                  <FontAwesomeV6Icon iconStyle="solid" iconName="download" />
                }
              >
                Download
              </MuiButton>
            }
            rightHeaderContent={
              <>
                <WorkspaceHeader.TemplateIcon />
                {!readonlyWorkspace && (
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
                )}
              </>
            }
          >
            <WorkspaceAlerts
              inWorkspaceContainer
              hasStandaloneProjectLevel={false}
            />
            <ReactFlowCanvas
              key={mountKey}
              updateSources={updateSources}
              levelName={levelProperties.name}
              initialNodes={initialNodes}
              initialEdges={initialEdges}
              initialViewport={initialViewport}
              colorMode={colorMode}
              readOnly={readonlyWorkspace}
              pendingImageImport={pendingImageImport}
              onImageImportConsumed={clearPendingImageImport}
            />
            {WorkspaceAlert}
          </PanelContainer>
        </div>
      </div>
    </BackpackAPIContext.Provider>
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
