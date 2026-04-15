import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import {
  addEdge,
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type OnConnect,
  type Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, {useCallback, useEffect, useRef, useState} from 'react';

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

import Toolbar from './components/Toolbar';
import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  SAVE_DEBOUNCE_MS,
} from './constants';
import ImageNode from './nodes/ImageNode';
import ShapeNode from './nodes/ShapeNode';
import TextNode from './nodes/TextNode';
import {
  ImageNodeData,
  ReactFlowSketchLabSources,
  ShapeNodeData,
  TextNodeData,
} from './types';

import styles from './react-flow-sketch-lab-view.module.scss';

export const REACT_FLOW_DEFAULT_SOURCES: ReactFlowSketchLabSources = {
  source: {nodes: [], edges: []},
};

const NODE_TYPES = {
  shape: ShapeNode,
  image: ImageNode,
  text: TextNode,
};

const MIN_INFO_PANEL_WIDTH = 250;
const INITIAL_INFO_PANEL_WIDTH = 290;
const MIN_WORKSPACE_WIDTH = 400;
const INITIAL_WORKSPACE_WIDTH = 800;

// Offset added per new node so they don't stack exactly on top of each other.
const NEW_NODE_STAGGER_PX = 20;

function ReactFlowSketchLabViewInner({
  levelProperties,
}: LabProps<LevelProperties>) {
  const {
    currentSources,
    updateSources,
    setReinitializationHandler,
    showStartOverDialog,
  } = useSources<ReactFlowSketchLabSources>();

  // Deep-clone sources so React Flow can mutate node style objects (e.g. during resize).
  // The sources system freezes returned objects, but NodeResizer writes to node.style in place.
  const initialSource = structuredClone(currentSources.source ?? {});
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (initialSource.nodes as Node[]) ?? []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    (initialSource.edges as Edge[]) ?? []
  );
  const [viewport, setViewport] = useState<Viewport | undefined>(
    initialSource.viewport
  );

  const {screenToFlowPosition} = useReactFlow();

  const readonlyWorkspace = useAppSelector(isReadOnlyWorkspace);
  const hasRun = useAppSelector(state => state.lab2System.hasRun);
  const {theme} = useTheme();
  const colorMode = theme.toLowerCase() as 'light' | 'dark';

  // Track how many nodes have been added this session to stagger placement.
  const addedNodeCountRef = useRef(0);

  // Debounced save: sync ReactFlow state back to project sources.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      updateSources(prev => ({
        ...prev,
        source: {nodes, edges, viewport},
      }));
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [nodes, edges, viewport, updateSources]);

  // Since there's no run button in Sketch Lab, set hasRun to true by default
  // to enable the Submit button on submittable levels.
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setHasRun(true));
    return () => {
      dispatch(setHasRun(false));
    };
  }, [dispatch]);

  // Mount key used to force-reset the React Flow canvas on reinitialization
  // (e.g. when version history loads a different version).
  const [mountKey, setMountKey] = useState(0);
  const reinitializationHandler = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setViewport(undefined);
    addedNodeCountRef.current = 0;
    setMountKey(key => key + 1);
  }, [setNodes, setEdges]);

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

  const onConnect: OnConnect = useCallback(
    connection => setEdges(eds => addEdge(connection, eds)),
    [setEdges]
  );

  const handleMoveEnd = useCallback((_event: unknown, vp: Viewport) => {
    setViewport(vp);
  }, []);

  const handleAddNode = useCallback(
    (
      type: 'shape' | 'image' | 'text',
      data: ShapeNodeData | ImageNodeData | TextNodeData
    ) => {
      const stagger = addedNodeCountRef.current * NEW_NODE_STAGGER_PX;
      addedNodeCountRef.current += 1;

      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - DEFAULT_NODE_WIDTH / 2 + stagger,
        y: window.innerHeight / 2 - DEFAULT_NODE_HEIGHT / 2 + stagger,
      });

      const newNodeId = crypto.randomUUID();
      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: data as unknown as Node['data'],
        style: {
          width: DEFAULT_NODE_WIDTH,
          height: DEFAULT_NODE_HEIGHT,
        },
      };

      setNodes(nds => [...nds, newNode]);

      // Move focus to the new node after React Flow renders it.
      // Blur the active toolbar button first, then wait for the DOM element.
      (document.activeElement as HTMLElement)?.blur();
      setTimeout(() => {
        const nodeEl = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${newNodeId}"]`
        );
        nodeEl?.focus();
      }, 100);
    },
    [screenToFlowPosition, setNodes]
  );

  const onClickStartOver = useCallback(() => {
    showStartOverDialog('custom', commonI18n.startOverGeneric());
  }, [showStartOverDialog]);

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
          <div className={styles.canvasContainer}>
            <Toolbar onAddNode={handleAddNode} />
            <ReactFlow
              key={mountKey}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={NODE_TYPES}
              onMoveEnd={handleMoveEnd}
              defaultViewport={viewport}
              fitView={!viewport}
              colorMode={colorMode}
              deleteKeyCode="Delete"
              proOptions={{hideAttribution: true}}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
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
