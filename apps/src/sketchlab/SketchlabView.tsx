import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type OnConnect,
  type ReactFlowInstance,
} from '@xyflow/react';
import cloneDeep from 'lodash/cloneDeep';
import React, {useEffect, useCallback, useRef, useState, useMemo} from 'react';

import '@xyflow/react/dist/style.css';

import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {
  LabProps,
  LevelProperties,
  ProjectSources,
  SketchlabNode,
  SketchlabEdge,
} from '@cdo/apps/lab2/types';
import TeacherViewingStudentProjectAlert from '@cdo/apps/lab2/views/alerts/teacherViewingStudentProject';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import WorkspaceHeader from '@cdo/apps/lab2/views/components/WorkspaceHeader';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useDialogControl} from '../lab2/views/dialogs';
import {BackpackAPIContext} from '../sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '../sharedComponents/backpack/BackpackClientApi';

import TextBoxNode from './TextBoxNode';
import {SketchlabSources} from './types';
import useSketchlabTour from './useSketchlabTour';
import {handleSaveToBackpack} from './utils';

import moduleStyles from './styles/sketchlab-view.module.scss';

const MIN_INFO_PANEL_WIDTH = 250;
const INITIAL_INFO_PANEL_WIDTH = 290;
const MIN_WORKSPACE_WIDTH = 400;
const INITIAL_WORKSPACE_WIDTH = 800;

const DEBOUNCED_WORKSPACE_SERIALIZATION_MS = 200;

const DEFAULT_SOURCES = {source: {nodes: [], edges: []}};

const nodeTypes = {
  textBox: TextBoxNode,
};

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

const SketchlabCanvas: React.FC<{
  levelProperties: LevelProperties;
}> = ({levelProperties}) => {
  const {
    currentSources,
    updateSources,
    setReinitializationHandler,
    showStartOverDialog,
  } = useSources<SketchlabSources>();

  const saveSourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const readonlyWorkspace = useAppSelector(isReadOnlyWorkspace);

  const initialNodes = useMemo(
    () => cloneDeep(currentSources.source.nodes || []) as Node[],
    [currentSources.source.nodes]
  );
  const initialEdges = useMemo(
    () => cloneDeep(currentSources.source.edges || []) as Edge[],
    [currentSources.source.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Remount key for when sources are reinitialized
  const [mountKey, setMountKey] = useState(0);

  const onClickStartOver = useCallback(() => {
    showStartOverDialog('custom', commonI18n.startOverGeneric());
  }, [showStartOverDialog]);

  const {theme} = useTheme();

  const hasRun = useAppSelector(state => state.lab2System.hasRun);

  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const backpackContext = useMemo(() => {
    if (currentUserId) {
      return {primaryApi: new BackpackClientApi('sketchlab', null)};
    }
    return null;
  }, [currentUserId]);
  const dialogControl = useDialogControl();

  // Debounced save of nodes/edges to project sources.
  // We cast ReactFlow's Node/Edge types to our plain serializable types
  // to avoid Immer WritableDraft incompatibilities in Redux.
  const debouncedSave = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (saveSourcesTimeoutRef.current) {
        clearTimeout(saveSourcesTimeoutRef.current);
        saveSourcesTimeoutRef.current = null;
      }

      saveSourcesTimeoutRef.current = setTimeout(() => {
        const viewport = reactFlowInstanceRef.current?.getViewport();
        updateSources(() => ({
          source: {
            nodes: currentNodes as unknown as SketchlabNode[],
            edges: currentEdges as unknown as SketchlabEdge[],
            viewport: viewport
              ? {x: viewport.x, y: viewport.y, zoom: viewport.zoom}
              : undefined,
          },
        }));
      }, DEBOUNCED_WORKSPACE_SERIALIZATION_MS);
    },
    [updateSources]
  );

  // Save whenever nodes or edges change
  useEffect(() => {
    debouncedSave(nodes, edges);
  }, [nodes, edges, debouncedSave]);

  useEffect(() => {
    return () => {
      if (saveSourcesTimeoutRef.current) {
        clearTimeout(saveSourcesTimeoutRef.current);
      }
    };
  }, []);

  const onConnect: OnConnect = useCallback(
    connection =>
      setEdges(eds =>
        addEdge(
          {
            ...connection,
            type: 'default',
            markerEnd: {type: MarkerType.ArrowClosed},
          },
          eds
        )
      ),
    [setEdges]
  );

  // Add a new text box node at the center of the current viewport
  const addNode = useCallback(() => {
    const instance = reactFlowInstanceRef.current;
    const viewport = instance?.getViewport() ?? {x: 0, y: 0, zoom: 1};
    const wrapper = document.querySelector(`.${moduleStyles.reactFlowWrapper}`);
    const rect = wrapper?.getBoundingClientRect();
    const centerX = (rect?.width ?? 800) / 2;
    const centerY = (rect?.height ?? 600) / 2;
    const position = {
      x: (centerX - viewport.x) / viewport.zoom,
      y: (centerY - viewport.y) / viewport.zoom,
    };
    const newNode: Node = {
      id: getNodeId(),
      type: 'textBox',
      position,
      data: {text: ''},
    };
    setNodes(nds => nds.concat(newNode));
  }, [setNodes]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

  // Reinitialization handler for when sources change externally
  const reinitializationHandler = useCallback(() => {
    setMountKey(key => key + 1);
  }, []);

  const onLoadVersion = useCallback(
    (sources: ProjectSources) => {
      if (sources) {
        updateSources(sources as SketchlabSources);
      }
      reinitializationHandler();
    },
    [updateSources, reinitializationHandler]
  );

  useEffect(() => {
    setReinitializationHandler(reinitializationHandler);
  }, [setReinitializationHandler, reinitializationHandler]);

  // Reinitialize nodes/edges when mount key changes (source reinitialized)
  useEffect(() => {
    if (mountKey > 0) {
      setNodes(cloneDeep(currentSources.source.nodes || []) as Node[]);
      setEdges(cloneDeep(currentSources.source.edges || []) as Edge[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountKey]);

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

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setHasRun(true));
    return () => {
      dispatch(setHasRun(false));
    };
  }, [dispatch]);

  useSketchlabTour({productTours: levelProperties.productTours});

  const teacherViewingStudent = Boolean(
    useAppSelector(state => state.progress.viewAsUserId)
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

  const defaultViewport = currentSources.source.viewport || {
    x: 0,
    y: 0,
    zoom: 1,
  };

  const colorMode = theme.toLowerCase() === 'dark' ? 'dark' : 'light';

  return (
    <BackpackAPIContext.Provider value={backpackContext}>
      <div className={moduleStyles.sketchlabContainer}>
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
                DEFAULT_SOURCES,
              onLoadVersion: onLoadVersion,
            }}
            backpackProps={{
              validateFileName: (fileName: string) => ({
                isSupportFileName: false,
                newFileName: fileName,
              }),
              saveFileToProject: () => {},
              createNewProjectFile: () => {},
              findIdForFileName: () => undefined,
              saveToBackpackButton: {
                onClick: (
                  fileList: string[],
                  errorCallback: (error: string) => void
                ) =>
                  handleSaveToBackpack(
                    reactFlowInstanceRef.current,
                    backpackContext?.primaryApi,
                    dialogControl,
                    fileList,
                    errorCallback
                  ),
                text: 'Save Sketch to Backpack',
              },
              supportedFileTypes: [],
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
            <div className={moduleStyles.reactFlowWrapper}>
              <ReactFlow
                key={mountKey}
                nodes={nodes}
                edges={edges}
                onNodesChange={readonlyWorkspace ? undefined : onNodesChange}
                onEdgesChange={readonlyWorkspace ? undefined : onEdgesChange}
                onConnect={readonlyWorkspace ? undefined : onConnect}
                nodeTypes={nodeTypes}
                onInit={onInit}
                defaultViewport={defaultViewport}
                nodesDraggable={!readonlyWorkspace}
                nodesConnectable={!readonlyWorkspace}
                elementsSelectable={!readonlyWorkspace}
                nodesFocusable={true}
                edgesFocusable={true}
                colorMode={colorMode}
                fitView
              >
                <Controls />
                <Background />
              </ReactFlow>
              {!readonlyWorkspace && (
                <div className={moduleStyles.floatingToolbar}>
                  <button
                    className={moduleStyles.toolbarButton}
                    onClick={addNode}
                    title="Add text box"
                    aria-label="Add text box"
                    type="button"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <rect
                        x="2"
                        y="4"
                        width="20"
                        height="16"
                        rx="4"
                        ry="4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <text
                        x="12"
                        y="15"
                        textAnchor="middle"
                        fontSize="9"
                        fill="currentColor"
                        fontFamily="sans-serif"
                      >
                        T
                      </text>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {WorkspaceAlert}
          </PanelContainer>
        </div>
      </div>
    </BackpackAPIContext.Provider>
  );
};

export default (props: LabProps<LevelProperties>) => (
  <SourcesContainer
    {...props}
    defaultSources={DEFAULT_SOURCES}
    key={props.levelProperties.id}
  >
    <ReactFlowProvider>
      <SketchlabCanvas levelProperties={props.levelProperties} />
    </ReactFlowProvider>
  </SourcesContainer>
);
