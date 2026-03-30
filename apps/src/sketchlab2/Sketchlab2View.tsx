import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import {
  addEdge,
  Background,
  Controls,
  getNodesBounds,
  getViewportForBounds,
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
  Sketchlab2Node,
  Sketchlab2Edge,
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

import ImageNode from './ImageNode';
import NodePalette, {type NodeShape} from './NodePalette';
import PalettePositionContext from './PalettePositionContext';
import TextBoxNode from './TextBoxNode';
import {Sketchlab2Sources} from './types';
import useSketchlab2Tour from './useSketchlab2Tour';
import {handleSaveToBackpack} from './utils';
import {uploadImageFile} from './utils/uploadImage';

import moduleStyles from './styles/sketchlab2-view.module.scss';

const MIN_INFO_PANEL_WIDTH = 250;
const INITIAL_INFO_PANEL_WIDTH = 290;
const MIN_WORKSPACE_WIDTH = 400;
const INITIAL_WORKSPACE_WIDTH = 800;

const DEBOUNCED_WORKSPACE_SERIALIZATION_MS = 200;

const DEFAULT_SOURCES = {source: {nodes: [], edges: []}};

const nodeTypes = {
  textBox: TextBoxNode,
  image: ImageNode,
};

const getNodeId = () => crypto.randomUUID();

// Fixed shape height matching the rectangle's rendered size
// (min-height 60 + padding 16 + border 4 = 80px in content-box).
const SHAPE_HEIGHT = 80;

// Ensure circle/triangle nodes use the standard SHAPE_HEIGHT.
const normalizeNodeDimensions = (nodes: Node[]): Node[] =>
  nodes.map(n => {
    const shape = n.data?.shape as string | undefined;
    if (shape === 'triangle') {
      const w = Math.round(SHAPE_HEIGHT * (2 / Math.sqrt(3)));
      return {
        ...n,
        width: w,
        height: SHAPE_HEIGHT,
        style: {...(n.style ?? {}), width: w, height: SHAPE_HEIGHT},
      };
    }
    if (shape === 'circle') {
      return {
        ...n,
        width: SHAPE_HEIGHT,
        height: SHAPE_HEIGHT,
        style: {
          ...(n.style ?? {}),
          width: SHAPE_HEIGHT,
          height: SHAPE_HEIGHT,
        },
      };
    }
    return n;
  });

const Sketchlab2Canvas: React.FC<{
  levelProperties: LevelProperties;
}> = ({levelProperties}) => {
  const {
    currentSources,
    updateSources,
    setReinitializationHandler,
    showStartOverDialog,
  } = useSources<Sketchlab2Sources>();

  const saveSourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readonlyWorkspace = useAppSelector(isReadOnlyWorkspace);
  const channelId =
    useAppSelector(state => state.lab.channel && state.lab.channel.id) || '';

  const initialNodes = useMemo(
    () =>
      normalizeNodeDimensions(
        cloneDeep(currentSources.source.nodes || []) as Node[]
      ),
    [currentSources.source.nodes]
  );
  const initialEdges = useMemo(
    () => cloneDeep(currentSources.source.edges || []) as Edge[],
    [currentSources.source.edges]
  );

  console.log('sketchlab2 load:', {
    nodes: initialNodes.length,
    edges: initialEdges.length,
    rawEdges: currentSources.source.edges,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Remount key for when sources are reinitialized
  const [mountKey, setMountKey] = useState(0);

  const toolbarPosition = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sketchlab2-toolbar-position') === 'left'
      ? 'left'
      : 'top';
  }, []);

  const palettePosition = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sketchlab2-nodepalette-position') === 'left'
      ? 'left'
      : 'top';
  }, []) as 'left' | 'top';

  const onClickStartOver = useCallback(() => {
    showStartOverDialog('custom', commonI18n.startOverGeneric());
  }, [showStartOverDialog]);

  const {theme} = useTheme();

  const hasRun = useAppSelector(state => state.lab2System.hasRun);

  const currentUserId = useAppSelector(state => state.currentUser.userId);
  const backpackContext = useMemo(() => {
    if (currentUserId) {
      return {primaryApi: new BackpackClientApi('sketchlab2', null)};
    }
    return null;
  }, [currentUserId]);
  const dialogControl = useDialogControl();

  // Debounced save of nodes/edges to project sources.
  // We cast ReactFlow's Node/Edge types to our plain serializable types
  // to avoid Immer WritableDraft incompatibilities in Redux Toolkit reducers.
  const debouncedSave = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (saveSourcesTimeoutRef.current) {
        clearTimeout(saveSourcesTimeoutRef.current);
        saveSourcesTimeoutRef.current = null;
      }

      saveSourcesTimeoutRef.current = setTimeout(() => {
        const viewport = reactFlowInstanceRef.current?.getViewport();
        const cleanNodes = currentNodes.map(
          ({dragging, selected, resizing, ...rest}) => rest
        );
        const source = {
          nodes: cleanNodes as unknown as Sketchlab2Node[],
          edges: currentEdges as unknown as Sketchlab2Edge[],
          viewport: viewport
            ? {x: viewport.x, y: viewport.y, zoom: viewport.zoom}
            : undefined,
        };
        console.log('sketchlab2 sources:', source);
        updateSources(() => ({source}));
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

  const addImageNode = useCallback(
    (url: string, filename: string) => {
      const instance = reactFlowInstanceRef.current;
      const viewport = instance?.getViewport() ?? {x: 0, y: 0, zoom: 1};
      const wrapper = document.querySelector(
        `.${moduleStyles.reactFlowWrapper}`
      );
      const rect = wrapper?.getBoundingClientRect();
      const centerX = (rect?.width ?? 800) / 2;
      const centerY = (rect?.height ?? 600) / 2;
      const position = {
        x: (centerX - viewport.x) / viewport.zoom,
        y: (centerY - viewport.y) / viewport.zoom,
      };
      const newNode: Node = {
        id: getNodeId(),
        type: 'image',
        position,
        data: {url, filename},
        width: 120,
        height: 90,
        style: {width: 120, height: 90},
      };
      setNodes(nds => nds.concat(newNode));
    },
    [setNodes]
  );

  const onFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // Reset the input so the same file can be selected again later
      event.target.value = '';
      if (!file || !channelId) return;
      try {
        const url = await uploadImageFile(file, channelId);
        addImageNode(url, file.name);
      } catch {
        console.error('Failed to upload image');
      }
    },
    [channelId, addImageNode]
  );

  const downloadPng = useCallback(async () => {
    if (nodes.length === 0) return;

    const PADDING = 50;
    const SCALE = 2;
    const bounds = getNodesBounds(nodes);
    const imageWidth = bounds.width + PADDING * 2;
    const imageHeight = bounds.height + PADDING * 2;
    const viewport = getViewportForBounds(
      bounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
      PADDING
    );

    const viewportEl = document.querySelector(
      '.react-flow__viewport'
    ) as HTMLElement | null;
    if (!viewportEl) return;

    // Clone the viewport and prepare it for serialization
    const clone = viewportEl.cloneNode(true) as HTMLElement;
    clone.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

    // Convert all <img> elements to base64 data URLs so they render
    // inside the foreignObject SVG (external URLs are blocked).
    const imgs = clone.querySelectorAll('img');
    await Promise.all(
      Array.from(imgs).map(async imgEl => {
        try {
          const resp = await fetch(imgEl.src);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          imgEl.src = dataUrl;
        } catch {
          // Leave the src as-is if fetching fails
        }
      })
    );

    // Inline all computed styles so they survive serialization
    const originals = viewportEl.querySelectorAll('*');
    const clones = clone.querySelectorAll('*');
    for (let i = 0; i < clones.length; i++) {
      const computed = window.getComputedStyle(originals[i]);
      const inline = (clones[i] as HTMLElement).style;
      if (!inline) continue;
      for (let j = 0; j < computed.length; j++) {
        const prop = computed[j];
        inline.setProperty(prop, computed.getPropertyValue(prop));
      }
    }

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}">
        <foreignObject width="100%" height="100%">
          ${new XMLSerializer().serializeToString(clone)}
        </foreignObject>
      </svg>`;

    const canvas = document.createElement('canvas');
    canvas.width = imageWidth * SCALE;
    canvas.height = imageHeight * SCALE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#292f36';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, imageWidth * SCALE, imageHeight * SCALE);
      const link = document.createElement('a');
      link.download = 'sketch.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src =
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  }, [nodes]);

  // --- Left-side palette for the selected textBox node ---
  const selectedTextBox = nodes.find(n => n.selected && n.type === 'textBox');

  const onPaletteColorSelect = useCallback(
    (newColor: string | null) => {
      if (!selectedTextBox) return;
      setNodes(ns =>
        ns.map(n =>
          n.id === selectedTextBox.id
            ? {...n, data: {...n.data, color: newColor}}
            : n
        )
      );
    },
    [selectedTextBox, setNodes]
  );

  const onPaletteShapeSelect = useCallback(
    (newShape: NodeShape) => {
      if (!selectedTextBox) return;
      const RECT_WIDTH = 170;
      const TRI_WIDTH = Math.round(SHAPE_HEIGHT * (2 / Math.sqrt(3)));

      setNodes(ns =>
        ns.map(n => {
          if (n.id !== selectedTextBox.id) return n;

          const oldW =
            (n.style?.width as number | undefined) ??
            (n.measured as {width?: number} | undefined)?.width ??
            RECT_WIDTH;
          const newW =
            newShape === 'circle'
              ? SHAPE_HEIGHT
              : newShape === 'triangle'
              ? TRI_WIDTH
              : RECT_WIDTH;
          const dx = (oldW - newW) / 2;
          const pos = {x: n.position.x + dx, y: n.position.y};
          const base = {
            ...n,
            position: pos,
            data: {...n.data, shape: newShape},
          };

          if (newShape === 'circle') {
            return {
              ...base,
              width: SHAPE_HEIGHT,
              height: SHAPE_HEIGHT,
              style: {
                ...(n.style ?? {}),
                width: SHAPE_HEIGHT,
                height: SHAPE_HEIGHT,
              },
            };
          }
          if (newShape === 'triangle') {
            return {
              ...base,
              width: TRI_WIDTH,
              height: SHAPE_HEIGHT,
              style: {
                ...(n.style ?? {}),
                width: TRI_WIDTH,
                height: SHAPE_HEIGHT,
              },
            };
          }
          const restStyle = {
            ...((n.style ?? {}) as Record<string, unknown>),
          };
          delete restStyle.width;
          delete restStyle.height;
          return {
            ...base,
            width: undefined,
            height: undefined,
            style: restStyle,
          };
        })
      );
    },
    [selectedTextBox, setNodes]
  );

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
        updateSources(sources as Sketchlab2Sources);
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
      setNodes(
        normalizeNodeDimensions(
          cloneDeep(currentSources.source.nodes || []) as Node[]
        )
      );
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

  useSketchlab2Tour({productTours: levelProperties.productTours});

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
    appName: 'sketchlab2',
  });

  const defaultViewport = currentSources.source.viewport || {
    x: 0,
    y: 0,
    zoom: 1,
  };

  const colorMode = theme.toLowerCase() === 'dark' ? 'dark' : 'light';

  return (
    <BackpackAPIContext.Provider value={backpackContext}>
      <div className={moduleStyles.sketchlab2Container}>
        <div style={{width: leftPanelWidth}} className={panelClassName}>
          <ResourcePanel
            levelProperties={levelProperties}
            isRunning={false}
            hasRun={hasRun}
            hasEdited={false}
            settings={[useThemeSetting('sketchlab2')]}
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
              <PalettePositionContext.Provider value={palettePosition}>
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
                  proOptions={{hideAttribution: true}}
                  fitView
                >
                  <Controls />
                  <Background />
                </ReactFlow>
              </PalettePositionContext.Provider>
              {!readonlyWorkspace && (
                <div
                  className={`${moduleStyles.floatingToolbar} ${
                    toolbarPosition === 'left'
                      ? moduleStyles.floatingToolbarLeft
                      : ''
                  } sketchlab2-toolbar`}
                >
                  <button
                    className={moduleStyles.toolbarButton}
                    onClick={addNode}
                    title="Add text box"
                    aria-label="Add text box"
                    type="button"
                  >
                    <FontAwesomeV6Icon iconStyle="solid" iconName="font" />
                  </button>
                  <button
                    className={moduleStyles.toolbarButton}
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload image"
                    aria-label="Upload image"
                    type="button"
                    disabled={!channelId}
                  >
                    <FontAwesomeV6Icon iconStyle="solid" iconName="image" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{display: 'none'}}
                    onChange={onFileInputChange}
                  />
                  <div className={moduleStyles.toolbarSeparator} />
                  <button
                    className={moduleStyles.toolbarButton}
                    onClick={downloadPng}
                    title="Download as PNG"
                    aria-label="Download as PNG"
                    type="button"
                    disabled={nodes.length === 0}
                  >
                    <FontAwesomeV6Icon iconStyle="solid" iconName="download" />
                  </button>
                </div>
              )}
              {palettePosition === 'left' && selectedTextBox && (
                <div
                  className={`${moduleStyles.fixedPalette} ${
                    toolbarPosition === 'left'
                      ? moduleStyles.fixedPaletteBelowToolbar
                      : ''
                  }`}
                >
                  <NodePalette
                    selectedColor={
                      (selectedTextBox.data.color as string | null) ?? null
                    }
                    onColorSelect={onPaletteColorSelect}
                    selectedShape={
                      (selectedTextBox.data.shape as NodeShape) ?? 'rectangle'
                    }
                    onShapeSelect={onPaletteShapeSelect}
                    vertical
                  />
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
      <Sketchlab2Canvas levelProperties={props.levelProperties} />
    </ReactFlowProvider>
  </SourcesContainer>
);
