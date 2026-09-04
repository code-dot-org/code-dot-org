import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import Tabs from '@code-dot-org/component-library/tabs';
import TextField from '@code-dot-org/component-library/textField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, {
  CSSProperties,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import PixelEditorModal, {
  type PixelEditorHandle,
} from '@cdo/apps/pixelEditor/PixelEditorModal';

import {generateBuildLabText} from './ai';
import BlocklyWorkspace, {
  appendDesignEventToWorkspace,
  getDesignEventsFromWorkspace,
  removeDesignEventFromWorkspace,
  removeDesignEventsForElement,
  removeDesignEventsForScreen,
  removeAssetReferencesInWorkspace,
  removeModelReferencesInWorkspace,
  renameElementReferencesInWorkspace,
  renameScreenReferencesInWorkspace,
  updateDesignEventInWorkspace,
  type BuildlabDropdownOption,
  type BuildlabDesignEvent,
  type BuildlabWorkspaceState,
} from './BlocklyWorkspace';
import BuildLabEngine from './BuildLabEngine';
import {
  createMlModelElements,
  getMlFeatureValuesFromElements,
  predictMlModel,
} from './mlModel';
import MlModelManager, {type ProvidedMlModel} from './MlModelManager';
import {
  DEFAULT_PROJECT,
  type Asset,
  type AssetType,
  type BuildLabProject,
  type ElementKind,
  type ImportedMlModel,
  type KeyValuePair,
  type ObjectFit,
  type StageElement,
  type StageScreen,
  type TextAlignment,
  serializeBuildLabProject,
} from './project';
import {
  clampToStage,
  STAGE_SIZE,
  type ArrowDirection,
  type KeyboardMovement,
  type RuntimeAnimation,
  type RuntimeState,
} from './runtime';
import SpriteDataEditor from './SpriteDataEditor';

import styles from './buildlab-view.module.scss';

type Tab = 'build' | 'design' | 'create' | 'data';
type ViewMode = 'workspace' | 'preview' | 'split';
type DesignInspectorTab = 'properties' | 'events';
type EventAction = BuildlabDesignEvent['action'];

type DesignEvent = BuildlabDesignEvent;

const EMPTY_PROVIDED_MODELS: ProvidedMlModel[] = [];

type DataSection = 'tables' | 'keyValues';
type ElementOrder = 'back' | 'backward' | 'forward' | 'front';

const GRID_SIZE = 5;
const NEW_ELEMENT_DROP_OFFSETS: Record<ElementKind, {x: number; y: number}> = {
  button: {x: 60, y: 22},
  dropdown: {x: 85, y: 18},
  label: {x: 70, y: 16},
  sprite: {x: 38, y: 38},
  textArea: {x: 110, y: 45},
  textInput: {x: 85, y: 18},
};
const DEFAULT_WORKSPACE_RATIO = 62;
const MIN_WORKSPACE_RATIO = 35;
const MAX_WORKSPACE_RATIO = 72;
const WORKSPACE_RATIO_STEP = 4;
const TABS = [
  {text: 'Build', value: 'build', tabContent: <></>},
  {text: 'Design', value: 'design', tabContent: <></>},
  {text: 'Create', value: 'create', tabContent: <></>},
  {text: 'Data', value: 'data', tabContent: <></>},
];
const VIEW_MODES = [
  {
    label: 'Code',
    value: 'workspace',
    ariaLabel: 'Show the code workspace',
    iconLeft: {iconName: 'code', iconStyle: 'solid' as const},
  },
  {
    label: 'Preview',
    value: 'preview',
    ariaLabel: 'Show the project preview',
    iconLeft: {iconName: 'eye', iconStyle: 'solid' as const},
  },
  {
    label: 'Split view',
    value: 'split',
    ariaLabel: 'Show the workspace and preview side by side',
    iconLeft: {iconName: 'table-columns', iconStyle: 'solid' as const},
  },
];
const INSPECTOR_TABS = [
  {text: 'Properties', value: 'properties', tabContent: <></>},
  {text: 'Events', value: 'events', tabContent: <></>},
];
const EVENT_ACTIONS = [
  {text: 'Change the text of an element', value: 'changeText'},
  {text: 'Go to another screen', value: 'goToScreen'},
  {text: 'Predict with an ML model', value: 'predictModel'},
  {text: 'Generate text with AI', value: 'generateText'},
];
const ASSET_TYPES = [
  {text: 'Costumes', value: 'costume'},
  {text: 'Animations', value: 'animation'},
  {text: 'Backgrounds', value: 'background'},
];
const DATA_TABS = [
  {text: 'Data tables', value: 'tables', tabContent: <></>},
  {text: 'Key/value pairs', value: 'keyValues', tabContent: <></>},
];
const DEFAULT_SCREEN_BACKGROUND_COLOR = '#ffffff';
const ARROW_KEY_DIRECTIONS: Record<string, ArrowDirection> = {
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  ArrowUp: 'ArrowUp',
};

function getAssetImageUrl(asset: Asset): string | undefined {
  return asset.dataUrl ?? asset.sourceUrl;
}

function getAssetEditorImageUrl(asset: Asset): string | undefined {
  const imageUrl = getAssetImageUrl(asset);
  if (
    !imageUrl ||
    asset.dataUrl ||
    typeof window === 'undefined' ||
    !/^https?:\/\//i.test(imageUrl)
  ) {
    return imageUrl;
  }

  // Library images are hosted separately from local Studio development. Use
  // the same-origin media proxy when preparing a library image for canvas
  // editing, otherwise the browser will taint the canvas.
  return `${window.location.origin}/media?u=${encodeURIComponent(imageUrl)}`;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)
  );
}

const FONT_FAMILY_OPTIONS = [
  'Arial',
  'Georgia',
  'Palatino',
  'Times',
  'Courier',
  'Lucida Console',
  'Arial Black',
  'Comic',
  'Impact',
  'Lucida Sans',
  'Tahoma',
  'Trebuchet',
  'Verdana',
].map(fontFamily => ({text: fontFamily, value: fontFamily}));
const TEXT_ALIGNMENT_OPTIONS: {text: string; value: TextAlignment}[] = [
  {text: 'Left', value: 'left'},
  {text: 'Right', value: 'right'},
  {text: 'Center', value: 'center'},
  {text: 'Justify', value: 'justify'},
];
const OBJECT_FIT_OPTIONS: {text: string; value: ObjectFit}[] = [
  {text: 'Fill', value: 'fill'},
  {text: 'Cover', value: 'cover'},
  {text: 'Contain', value: 'contain'},
  {text: 'None', value: 'none'},
];
const DEFAULT_ELEMENT_PROPERTIES = {
  button: {
    backgroundColor: '#248da8',
    borderColor: '#248da8',
    borderRadius: 4,
    borderWidth: 0,
    fontFamily: 'Arial',
    fontSize: 16,
    height: 44,
    iconColor: '#000000',
    objectFit: 'contain' as const,
    textAlign: 'center' as const,
    textColor: '#ffffff',
    visible: true,
    width: 120,
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderColor: '#9aa5b1',
    borderRadius: 4,
    borderWidth: 1,
    fontFamily: 'Arial',
    fontSize: 14,
    height: 36,
    iconColor: undefined,
    objectFit: 'contain' as const,
    textAlign: 'left' as const,
    textColor: '#1f2933',
    visible: true,
    width: 170,
  },
  label: {
    backgroundColor: 'transparent',
    borderColor: '#1f2933',
    borderRadius: 0,
    borderWidth: 0,
    fontFamily: 'Arial',
    fontSize: 20,
    height: 32,
    iconColor: undefined,
    objectFit: 'contain' as const,
    textAlign: 'left' as const,
    textColor: '#1f2933',
    visible: true,
    width: 180,
  },
  sprite: {
    backgroundColor: undefined,
    borderColor: undefined,
    borderRadius: undefined,
    borderWidth: undefined,
    fontFamily: 'Arial',
    fontSize: 16,
    height: 76,
    iconColor: undefined,
    objectFit: 'contain' as const,
    textAlign: 'center' as const,
    textColor: '#1f2933',
    visible: true,
    width: 76,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderColor: '#9aa5b1',
    borderRadius: 4,
    borderWidth: 1,
    fontFamily: 'Arial',
    fontSize: 14,
    height: 36,
    iconColor: undefined,
    objectFit: 'contain' as const,
    textAlign: 'left' as const,
    textColor: '#1f2933',
    visible: true,
    width: 170,
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderColor: '#9aa5b1',
    borderRadius: 4,
    borderWidth: 1,
    fontFamily: 'Arial',
    fontSize: 14,
    height: 90,
    iconColor: undefined,
    objectFit: 'contain' as const,
    textAlign: 'left' as const,
    textColor: '#1f2933',
    visible: true,
    width: 220,
  },
} as const;

function snapCoordinate(value: number, extent?: number) {
  return clampToStage(Math.round(value / GRID_SIZE) * GRID_SIZE, extent);
}

function defaultScreenId(screens: StageScreen[], fallback = 'screen1') {
  return (
    screens.find(screen => screen.isDefault)?.id ?? screens[0]?.id ?? fallback
  );
}

function stagePosition(
  container: HTMLElement,
  clientX: number,
  clientY: number,
  offset = {x: 0, y: 0},
  size?: {width?: number; height?: number}
) {
  const rect = container.getBoundingClientRect();
  return {
    x: snapCoordinate(
      ((clientX - rect.left) / rect.width) * STAGE_SIZE - offset.x,
      size?.width
    ),
    y: snapCoordinate(
      ((clientY - rect.top) / rect.height) * STAGE_SIZE - offset.y,
      size?.height
    ),
  };
}

function eventActionSummary(
  event: DesignEvent,
  elements: StageElement[],
  screens: StageScreen[]
) {
  if (event.action === 'goToScreen') {
    return `Go to ${
      screens.find(screen => screen.id === event.screenId)?.name ?? 'a screen'
    }`;
  }

  if (event.action === 'predictModel') {
    return `Show the prediction in ${
      elements.find(element => element.id === event.targetElementId)?.id ??
      'an element'
    }`;
  }

  if (event.action === 'generateText') {
    return `Generate AI text in ${
      elements.find(element => element.id === event.targetElementId)?.id ??
      'an element'
    }`;
  }

  const target = elements.find(element => element.id === event.targetElementId);
  return `Change ${target?.id ?? 'an element'} text to "${event.text ?? ''}"`;
}

function eventCodePreview(event: DesignEvent) {
  const action =
    event.action === 'goToScreen'
      ? `  setScreen(${JSON.stringify(event.screenId)});`
      : event.action === 'predictModel'
      ? `  predictModel(${JSON.stringify(event.modelId)}, ${JSON.stringify(
          event.targetElementId
        )});`
      : event.action === 'generateText'
      ? `  generateText(${JSON.stringify(event.prompt)}, ${JSON.stringify(
          event.targetElementId
        )});`
      : `  setText(${JSON.stringify(event.targetElementId)}, ${JSON.stringify(
          event.text ?? ''
        )});`;

  return `onEvent(${JSON.stringify(
    event.elementId
  )}, "click", function() {\n${action}\n});`;
}

export interface BuildLabProps {
  channelId?: string;
  initialProject?: BuildLabProject;
  onProjectChange?: (project: BuildLabProject) => void;
  providedModels?: ProvidedMlModel[];
  readOnly?: boolean;
}

export default function BuildlabView({
  channelId,
  initialProject,
  onProjectChange,
  providedModels = EMPTY_PROVIDED_MODELS,
  readOnly = false,
}: BuildLabProps) {
  // BuildlabContainer renders this view only after Lab2 has loaded the source.
  // Initialize the editor from that source so the first render is never
  // mistaken for a user edit during hydration.
  const initialEditorProject = initialProject ?? DEFAULT_PROJECT;
  const initialProjectSerialized = initialProject
    ? serializeBuildLabProject(initialProject)
    : undefined;
  const [activeTab, setActiveTab] = useState<Tab>('build');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const layoutRef = useRef<HTMLDivElement>(null);
  const stageContentRef = useRef<HTMLDivElement>(null);
  const draggedElementOffset = useRef({x: 0, y: 0});
  const [workspaceRatio, setWorkspaceRatio] = useState(DEFAULT_WORKSPACE_RATIO);
  const [isRunning, setIsRunning] = useState(false);
  const [runtimeElements, setRuntimeElements] = useState<StageElement[]>([]);
  const [runtimeScreenId, setRuntimeScreenId] = useState(() =>
    defaultScreenId(initialEditorProject.screens)
  );
  const [runtimeKeyboardMovements, setRuntimeKeyboardMovements] = useState<
    KeyboardMovement[]
  >([]);
  const [runtimeAnimations, setRuntimeAnimations] = useState<
    Record<string, RuntimeAnimation>
  >({});
  const runtimeRunIdRef = useRef(0);
  const runtimeEngineRef = useRef<BuildLabEngine | null>(null);
  const applyRuntimeStateRef = useRef<(state: RuntimeState) => void>(() => {});
  const [designInspectorTab, setDesignInspectorTab] =
    useState<DesignInspectorTab>('properties');
  const [showScreenProperties, setShowScreenProperties] = useState(false);
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);
  const [elements, setElements] = useState(initialEditorProject.elements);
  const [selectedElementId, setSelectedElementId] = useState('button1');
  const [screens, setScreens] = useState(initialEditorProject.screens);
  const [mlModels, setMlModels] = useState<ImportedMlModel[]>(
    initialEditorProject.mlModels ?? []
  );
  const [activeScreenId, setActiveScreenId] = useState(() =>
    defaultScreenId(initialEditorProject.screens)
  );
  const [workspaceState, setWorkspaceState] = useState<BuildlabWorkspaceState>(
    initialEditorProject.workspaceState
  );
  const [openEventType, setOpenEventType] = useState<'click' | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventAction, setEventAction] = useState<EventAction>('changeText');
  const [eventTargetId, setEventTargetId] = useState('label1');
  const [eventScreenId, setEventScreenId] = useState('screen1');
  const [eventModelId, setEventModelId] = useState('');
  const [eventPrompt, setEventPrompt] = useState('Write a friendly greeting');
  const [eventText, setEventText] = useState('Hello!');
  const [assets, setAssets] = useState(initialEditorProject.assets);
  const [selectedAssetId, setSelectedAssetId] = useState('bear');
  const [activeAssetType, setActiveAssetType] = useState<AssetType>('costume');
  const [dataSection, setDataSection] = useState<DataSection>('tables');
  const [dataTables, setDataTables] = useState(initialEditorProject.dataTables);
  const [selectedDataTableId, setSelectedDataTableId] = useState('scores');
  const [newDataTableName, setNewDataTableName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [newRowValues, setNewRowValues] = useState<Record<string, string>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowValues, setEditingRowValues] = useState<
    Record<string, string>
  >({});
  const [keyValuePairs, setKeyValuePairs] = useState<KeyValuePair[]>(
    initialEditorProject.keyValuePairs
  );
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingKeyValueId, setEditingKeyValueId] = useState<string | null>(
    null
  );
  const [editingKeyValue, setEditingKeyValue] = useState({key: '', value: ''});
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle'
  );
  const lastPublishedProjectRef = useRef<string | undefined>(
    initialProjectSerialized
  );

  const project = useMemo<BuildLabProject>(
    () => ({
      assets,
      dataTables,
      elements,
      keyValuePairs,
      mlModels,
      screens,
      starterAssetsVersion: DEFAULT_PROJECT.starterAssetsVersion,
      workspaceState,
    }),
    [
      assets,
      dataTables,
      elements,
      keyValuePairs,
      mlModels,
      screens,
      workspaceState,
    ]
  );
  const [saveStatus, setSaveStatus] = useState<
    'loading' | 'saved' | 'saving' | 'unsaved' | 'error'
  >('saved');

  // Lab2 owns loading and persistence. This editor reports changes after its
  // first render; the initial state above already came from the loaded source.
  useEffect(() => {
    if (!initialProjectSerialized) {
      return;
    }

    const serializedProject = serializeBuildLabProject(project);
    if (
      readOnly ||
      !onProjectChange ||
      serializedProject === lastPublishedProjectRef.current
    ) {
      return;
    }

    lastPublishedProjectRef.current = serializedProject;
    setSaveStatus('saving');
    onProjectChange(project);
    setSaveStatus('saved');
  }, [initialProjectSerialized, onProjectChange, project, readOnly]);

  const shareUrl = channelId
    ? `${window.location.origin}/projects/buildlab/${channelId}/view`
    : undefined;

  const handleShare = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('copied');
    } catch {
      setShareStatus('error');
    }
  };

  const selectedElement = useMemo(
    () => elements.find(element => element.id === selectedElementId),
    [elements, selectedElementId]
  );
  const selectedElementDefaults = selectedElement
    ? DEFAULT_ELEMENT_PROPERTIES[selectedElement.kind]
    : undefined;
  const designEvents = useMemo(
    () => getDesignEventsFromWorkspace(workspaceState),
    [workspaceState]
  );
  const selectedEvents = useMemo(
    () => designEvents.filter(event => event.elementId === selectedElementId),
    [designEvents, selectedElementId]
  );
  const selectedAsset =
    assets.find(asset => asset.id === selectedAssetId) ?? assets[0];
  const selectedSpriteAssetId =
    assets.find(
      asset => asset.id === selectedAssetId && asset.assetType !== 'background'
    )?.id ?? assets.find(asset => asset.assetType !== 'background')?.id;
  const visibleAssets = useMemo(
    () => assets.filter(asset => asset.assetType === activeAssetType),
    [activeAssetType, assets]
  );
  const selectedDataTable =
    dataTables.find(table => table.id === selectedDataTableId) ?? dataTables[0];
  const activeScreen =
    screens.find(screen => screen.id === activeScreenId) ?? screens[0];
  const activeScreenElements = useMemo(
    () => elements.filter(element => element.screenId === activeScreenId),
    [activeScreenId, elements]
  );
  const elementSelectorItems = activeScreenElements.length
    ? activeScreenElements.map(element => ({
        text: `${element.id} (${element.label})`,
        value: element.id,
      }))
    : [{text: 'No elements on this screen', value: ''}];
  const blocklyElementOptions = useMemo<BuildlabDropdownOption[]>(
    () =>
      elements.map(element => [`${element.id} (${element.label})`, element.id]),
    [elements]
  );
  const blocklySpriteOptions = useMemo<BuildlabDropdownOption[]>(
    () =>
      elements
        .filter(element => element.kind === 'sprite')
        .map(element => [`${element.id} (${element.label})`, element.id]),
    [elements]
  );
  const blocklyTouchTargetOptions = useMemo<BuildlabDropdownOption[]>(() => {
    const spriteOptions: BuildlabDropdownOption[] = elements
      .filter(element => element.kind === 'sprite')
      .map(
        element =>
          [
            `${element.id} (${element.label})`,
            element.id,
          ] as BuildlabDropdownOption
      );
    const classNames = Array.from(
      new Set(
        elements
          .filter(element => element.kind === 'sprite')
          .map(element => element.className?.trim())
          .filter((className): className is string => Boolean(className))
      )
    ).sort();

    return [
      ...spriteOptions,
      ...classNames.map(
        className =>
          [
            `${className} (class)`,
            `class:${className}`,
          ] as BuildlabDropdownOption
      ),
    ];
  }, [elements]);
  const blocklyScreenOptions = useMemo<BuildlabDropdownOption[]>(
    () => screens.map(screen => [screen.name, screen.id]),
    [screens]
  );
  const blocklyAssetOptions = useMemo<BuildlabDropdownOption[]>(
    () =>
      assets
        .filter(asset => asset.assetType !== 'background')
        .map(asset => [`${asset.name} (${asset.assetType})`, asset.id]),
    [assets]
  );
  const blocklyAnimationOptions = useMemo<BuildlabDropdownOption[]>(
    () =>
      assets
        .filter(
          asset => asset.assetType === 'animation' && asset.frames?.length
        )
        .map(asset => [asset.name, asset.id]),
    [assets]
  );
  const blocklyModelOptions = useMemo<BuildlabDropdownOption[]>(
    () => mlModels.map(model => [model.name, model.id]),
    [mlModels]
  );
  // MlModelManager reloads its catalog when this changes, so it must not be
  // rebuilt on every render.
  const importedModelIds = useMemo(
    () => mlModels.map(model => model.id),
    [mlModels]
  );
  const displayedScreenId = isRunning ? runtimeScreenId : activeScreenId;
  const displayedScreen =
    screens.find(screen => screen.id === displayedScreenId) ?? screens[0];
  const displayedBackgroundAsset = assets.find(
    asset => asset.id === displayedScreen?.backgroundAssetId
  );
  const displayedBackgroundImageUrl = displayedBackgroundAsset
    ? getAssetImageUrl(displayedBackgroundAsset)
    : undefined;
  const displayedElements = isRunning ? runtimeElements : elements;
  const hasPlayingRuntimeAnimations = Object.values(runtimeAnimations).some(
    animation => animation.playing
  );
  const hasRuntimeKeyboardMovements = runtimeKeyboardMovements.length > 0;
  const displayedScreenElements = useMemo(
    () =>
      displayedElements.filter(
        element => element.screenId === displayedScreenId
      ),
    [displayedElements, displayedScreenId]
  );
  const showWorkspace = viewMode !== 'preview';
  const showPreview = viewMode !== 'workspace';
  const layoutStyle =
    viewMode === 'split'
      ? ({'--workspace-width': `${workspaceRatio}%`} as CSSProperties)
      : undefined;

  const updateWorkspaceRatio = (clientX: number) => {
    const layout = layoutRef.current;
    if (!layout) {
      return;
    }

    const bounds = layout.getBoundingClientRect();
    if (bounds.width === 0) {
      return;
    }

    const nextRatio = ((clientX - bounds.left) / bounds.width) * 100;
    setWorkspaceRatio(
      Math.max(MIN_WORKSPACE_RATIO, Math.min(MAX_WORKSPACE_RATIO, nextRatio))
    );
  };

  const handleDividerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Home') {
      event.preventDefault();
      setWorkspaceRatio(MIN_WORKSPACE_RATIO);
    } else if (event.key === 'End') {
      event.preventDefault();
      setWorkspaceRatio(MAX_WORKSPACE_RATIO);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      setWorkspaceRatio(current =>
        Math.max(
          MIN_WORKSPACE_RATIO,
          Math.min(
            MAX_WORKSPACE_RATIO,
            current + direction * WORKSPACE_RATIO_STEP
          )
        )
      );
    }
  };

  const handleDividerPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateWorkspaceRatio(event.clientX);
  };

  const handleDividerPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      updateWorkspaceRatio(event.clientX);
    }
  };

  const handleDividerPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const addElement = (kind: ElementKind, position = {x: 150, y: 160}) => {
    if (isRunning || readOnly) {
      return;
    }

    let count = elements.filter(element => element.kind === kind).length + 1;
    while (elements.some(element => element.id === `${kind}${count}`)) {
      count += 1;
    }
    const label =
      kind === 'button'
        ? 'New button'
        : kind === 'dropdown'
        ? 'Choose an option'
        : kind === 'label'
        ? 'New label'
        : kind === 'textArea'
        ? 'Write something'
        : kind === 'textInput'
        ? 'Type something'
        : 'New sprite';
    const element: StageElement = {
      assetId: kind === 'sprite' ? selectedSpriteAssetId : undefined,
      id: `${kind}${count}`,
      kind,
      label,
      screenId: activeScreenId,
      ...DEFAULT_ELEMENT_PROPERTIES[kind],
      ...position,
    };
    setElements(current => [...current, element]);
    setSelectedElementId(element.id);
    setDesignInspectorTab('properties');
  };

  const updateElement = (id: string, changes: Partial<StageElement>) => {
    if (readOnly) {
      return;
    }
    setElements(current =>
      current.map(element =>
        element.id === id ? {...element, ...changes} : element
      )
    );
  };

  const changeElementOrder = (elementId: string, order: ElementOrder) => {
    if (readOnly) {
      return;
    }
    setElements(current => {
      const screenIndices = current.reduce<number[]>(
        (indices, element, index) => {
          if (element.screenId === activeScreenId) {
            indices.push(index);
          }
          return indices;
        },
        []
      );
      const currentScreenIndex = screenIndices.findIndex(
        index => current[index].id === elementId
      );
      if (currentScreenIndex === -1) {
        return current;
      }

      const targetScreenIndex =
        order === 'back'
          ? 0
          : order === 'front'
          ? screenIndices.length - 1
          : currentScreenIndex + (order === 'forward' ? 1 : -1);
      if (
        targetScreenIndex < 0 ||
        targetScreenIndex >= screenIndices.length ||
        targetScreenIndex === currentScreenIndex
      ) {
        return current;
      }

      const orderedElements = screenIndices.map(index => current[index]);
      const [movedElement] = orderedElements.splice(currentScreenIndex, 1);
      orderedElements.splice(targetScreenIndex, 0, movedElement);
      const next = [...current];
      screenIndices.forEach((index, position) => {
        next[index] = orderedElements[position];
      });
      return next;
    });
  };

  const addAsset = () => {
    if (readOnly) {
      return;
    }
    const assetNumber =
      assets.reduce((highest, asset) => {
        const match = /^asset(\d+)$/.exec(asset.id);
        return Math.max(highest, match ? Number(match[1]) : 0);
      }, 0) + 1;
    const asset = {
      id: `asset${assetNumber}`,
      assetType: activeAssetType,
      name: `${
        activeAssetType === 'animation'
          ? 'Animation'
          : activeAssetType === 'background'
          ? 'Background'
          : 'Costume'
      } ${assetNumber}`,
      style:
        activeAssetType === 'animation' ? ('sun' as const) : ('wave' as const),
    };
    setAssets(current => [...current, asset]);
    setSelectedAssetId(asset.id);
  };

  const changeAssetType = (assetType: AssetType) => {
    setActiveAssetType(assetType);
    const firstAsset = assets.find(asset => asset.assetType === assetType);
    if (firstAsset) {
      setSelectedAssetId(firstAsset.id);
    } else {
      setSelectedAssetId('');
    }
  };

  const saveAsset = (
    assetId: string,
    name: string,
    dataUrl?: string,
    frames?: string[]
  ) => {
    if (readOnly) {
      return;
    }
    setAssets(current =>
      current.map(asset =>
        asset.id === assetId
          ? {
              ...asset,
              dataUrl: frames?.[0] ?? dataUrl ?? asset.dataUrl,
              frames,
              name,
            }
          : asset
      )
    );
  };

  const deleteAsset = (assetId: string) => {
    if (readOnly || isRunning) {
      return;
    }

    const remainingAssets = assets.filter(asset => asset.id !== assetId);
    if (remainingAssets.length === assets.length) {
      return;
    }

    const nextAsset =
      remainingAssets.find(asset => asset.assetType === activeAssetType) ??
      remainingAssets[0];
    const replacementSpriteAssetId =
      remainingAssets.find(asset => asset.assetType !== 'background')?.id ?? '';
    const replacementAnimationAssetId =
      remainingAssets.find(asset => asset.assetType === 'animation')?.id ?? '';

    setAssets(remainingAssets);
    setElements(current =>
      current.map(element => {
        if (element.assetId !== assetId && element.imageAssetId !== assetId) {
          return element;
        }

        const nextElement = {...element};
        if (nextElement.assetId === assetId) {
          delete nextElement.assetId;
        }
        if (nextElement.imageAssetId === assetId) {
          delete nextElement.imageAssetId;
        }
        return nextElement;
      })
    );
    setScreens(current =>
      current.map(screen => {
        if (screen.backgroundAssetId !== assetId) {
          return screen;
        }

        const nextScreen = {...screen};
        delete nextScreen.backgroundAssetId;
        return nextScreen;
      })
    );
    setWorkspaceState(current =>
      removeAssetReferencesInWorkspace(
        current,
        assetId,
        replacementSpriteAssetId,
        replacementAnimationAssetId
      )
    );

    if (nextAsset) {
      setActiveAssetType(nextAsset.assetType);
      setSelectedAssetId(nextAsset.id);
    } else {
      setSelectedAssetId('');
    }
  };

  const addDataTable = () => {
    if (readOnly) {
      return;
    }
    const name = newDataTableName.trim();
    if (
      !name ||
      dataTables.some(table => table.name.toLowerCase() === name.toLowerCase())
    ) {
      return;
    }

    const table = {
      columns: [{id: 'column1', name: 'column1'}],
      id: `table-${Date.now()}`,
      name,
      rows: [],
    };
    setDataTables(current => [...current, table]);
    setSelectedDataTableId(table.id);
    setNewDataTableName('');
  };

  const deleteDataTable = () => {
    if (!selectedDataTable || readOnly) {
      return;
    }

    const nextTables = dataTables.filter(
      table => table.id !== selectedDataTable.id
    );
    setDataTables(nextTables);
    setSelectedDataTableId(nextTables[0]?.id ?? '');
    setEditingRowId(null);
  };

  const addColumn = () => {
    if (!selectedDataTable || readOnly) {
      return;
    }

    const baseName = newColumnName.trim() || 'column';
    const existingNames = selectedDataTable.columns.map(column => column.name);
    let columnName = baseName;
    let suffix = 1;
    while (existingNames.includes(columnName)) {
      suffix += 1;
      columnName = `${baseName}${suffix}`;
    }

    const column = {id: `column-${Date.now()}`, name: columnName};
    setDataTables(current =>
      current.map(table =>
        table.id === selectedDataTable.id
          ? {...table, columns: [...table.columns, column]}
          : table
      )
    );
    setNewColumnName('');
  };

  const renameColumn = (columnId: string, name: string) => {
    if (!selectedDataTable || !name.trim() || readOnly) {
      return;
    }
    setDataTables(current =>
      current.map(table =>
        table.id === selectedDataTable.id
          ? {
              ...table,
              columns: table.columns.map(column =>
                column.id === columnId ? {...column, name} : column
              ),
            }
          : table
      )
    );
  };

  const deleteColumn = (columnId: string) => {
    if (
      !selectedDataTable ||
      selectedDataTable.columns.length === 1 ||
      readOnly
    ) {
      return;
    }
    setDataTables(current =>
      current.map(table => {
        if (table.id !== selectedDataTable.id) {
          return table;
        }
        return {
          ...table,
          columns: table.columns.filter(column => column.id !== columnId),
          rows: table.rows.map(row => {
            const values = Object.fromEntries(
              Object.entries(row.values).filter(([id]) => id !== columnId)
            );
            return {...row, values};
          }),
        };
      })
    );
  };

  const addDataRow = () => {
    if (!selectedDataTable || readOnly) {
      return;
    }
    const row = {
      id: `${selectedDataTable.id}-row-${Date.now()}`,
      values: newRowValues,
    };
    setDataTables(current =>
      current.map(table =>
        table.id === selectedDataTable.id
          ? {...table, rows: [...table.rows, row]}
          : table
      )
    );
    setNewRowValues({});
  };

  const saveDataRow = () => {
    if (!selectedDataTable || !editingRowId || readOnly) {
      return;
    }
    setDataTables(current =>
      current.map(table =>
        table.id === selectedDataTable.id
          ? {
              ...table,
              rows: table.rows.map(row =>
                row.id === editingRowId
                  ? {...row, values: editingRowValues}
                  : row
              ),
            }
          : table
      )
    );
    setEditingRowId(null);
    setEditingRowValues({});
  };

  const addKeyValuePair = () => {
    if (readOnly) {
      return;
    }
    const key = newKey.trim();
    if (!key || keyValuePairs.some(pair => pair.key === key)) {
      return;
    }
    setKeyValuePairs(current => [
      ...current,
      {id: `key-${Date.now()}`, key, value: newValue},
    ]);
    setNewKey('');
    setNewValue('');
  };

  const saveKeyValuePair = () => {
    if (!editingKeyValueId || !editingKeyValue.key.trim() || readOnly) {
      return;
    }
    setKeyValuePairs(current =>
      current.map(pair =>
        pair.id === editingKeyValueId ? {...pair, ...editingKeyValue} : pair
      )
    );
    setEditingKeyValueId(null);
    setEditingKeyValue({key: '', value: ''});
  };

  const applyRuntimeState = (nextRuntimeState: RuntimeState) => {
    setRuntimeAnimations(nextRuntimeState.animations ?? {});
    setRuntimeElements(nextRuntimeState.elements);
    setRuntimeScreenId(nextRuntimeState.screenId);
    setRuntimeKeyboardMovements(nextRuntimeState.keyboardMovements ?? []);

    const runId = runtimeRunIdRef.current;
    const predictionRequests =
      runtimeEngineRef.current?.takePendingPredictions() ??
      (nextRuntimeState.pendingPrediction
        ? [nextRuntimeState.pendingPrediction]
        : []);
    predictionRequests.forEach(request => {
      const featureValues =
        request.kind === 'sprite'
          ? request.featureValues
          : getMlFeatureValuesFromElements(
              request.modelId,
              nextRuntimeState.elements
            );
      void predictMlModel(request.modelId, featureValues)
        .then(prediction => {
          if (runId !== runtimeRunIdRef.current) {
            return;
          }
          const engine = runtimeEngineRef.current;
          if (!engine) {
            return;
          }
          applyRuntimeState(
            engine.completePrediction(request, String(prediction))
          );
        })
        .catch(error => {
          if (runId !== runtimeRunIdRef.current) {
            return;
          }
          const message =
            error instanceof Error ? error.message : 'Check your inputs';
          const engine = runtimeEngineRef.current;
          if (!engine) {
            return;
          }
          applyRuntimeState(engine.failPrediction(request, message));
        });
    });

    const generationRequests =
      runtimeEngineRef.current?.takePendingGenerations() ??
      (nextRuntimeState.pendingGeneration
        ? [nextRuntimeState.pendingGeneration]
        : []);
    generationRequests.forEach(request => {
      const {prompt} = request;
      void generateBuildLabText(prompt, channelId)
        .then(response => {
          if (runId !== runtimeRunIdRef.current) {
            return;
          }
          const engine = runtimeEngineRef.current;
          if (!engine) {
            return;
          }
          applyRuntimeState(engine.completeGeneration(request, response));
        })
        .catch(error => {
          if (runId !== runtimeRunIdRef.current) {
            return;
          }
          const message =
            error instanceof Error ? error.message : 'Check your inputs';
          const engine = runtimeEngineRef.current;
          if (!engine) {
            return;
          }
          applyRuntimeState(engine.failGeneration(request, message));
        });
    });
  };
  applyRuntimeStateRef.current = applyRuntimeState;

  const toggleRun = () => {
    if (isRunning) {
      runtimeRunIdRef.current += 1;
      runtimeEngineRef.current = null;
      setIsRunning(false);
      setRuntimeAnimations({});
      setRuntimeKeyboardMovements([]);
      return;
    }

    runtimeRunIdRef.current += 1;

    const engine = new BuildLabEngine({
      assets,
      fallbackSpriteAssetId: assets.find(
        asset => asset.assetType !== 'background'
      )?.id,
      initialState: {
        elements: elements.map(element => ({...element})),
        animations: {},
        keyboardMovements: [],
        variables: {},
        screenId: defaultScreenId(screens, activeScreenId),
      },
      screens,
    });
    runtimeEngineRef.current = engine;
    applyRuntimeState(engine.run(workspaceState));
    setIsRunning(true);
  };

  const runElementEvent = (elementId: string) => {
    const engine = runtimeEngineRef.current;
    if (!engine) {
      return;
    }
    applyRuntimeState(engine.triggerClick(elementId));
  };

  const updateRuntimeElementValue = (elementId: string, value: string) => {
    runtimeEngineRef.current?.updateElement(elementId, {inputValue: value});
    setRuntimeElements(current =>
      current.map(element =>
        element.id === elementId ? {...element, inputValue: value} : element
      )
    );
  };

  const handleImportMlModel = async (model: ImportedMlModel) => {
    if (
      readOnly ||
      mlModels.some(importedModel => importedModel.id === model.id)
    ) {
      return;
    }

    const generated = createMlModelElements(
      model,
      activeScreenId,
      elements.map(element => element.id)
    );
    setMlModels(current => [...current, model]);
    setElements(current => [...current, ...generated.elements]);
    setSelectedElementId(generated.predictionButtonId);
    setDesignInspectorTab('properties');
    setWorkspaceState(current =>
      appendDesignEventToWorkspace(current, {
        action: 'predictModel',
        elementId: generated.predictionButtonId,
        eventType: 'click',
        id: `${generated.predictionButtonId}-event`,
        modelId: model.id,
        targetElementId: generated.resultElementId,
      })
    );
  };

  const handleRemoveMlModel = (modelId: string) => {
    if (readOnly) {
      return;
    }

    const removedElementIds = new Set(
      elements
        .filter(element => element.mlModelId === modelId)
        .map(element => element.id)
    );
    setMlModels(current => current.filter(model => model.id !== modelId));
    setElements(current =>
      current.filter(element => element.mlModelId !== modelId)
    );
    setWorkspaceState(current =>
      removeModelReferencesInWorkspace(current, modelId)
    );

    if (removedElementIds.has(selectedElementId)) {
      setSelectedElementId(
        elements.find(element => !removedElementIds.has(element.id))?.id ?? ''
      );
    }
    setEventModelId(current =>
      current === modelId
        ? mlModels.find(model => model.id !== modelId)?.id ?? ''
        : current
    );

    if (isRunning) {
      runtimeRunIdRef.current += 1;
      runtimeEngineRef.current = null;
      setIsRunning(false);
      setRuntimeAnimations({});
      setRuntimeElements([]);
      setRuntimeKeyboardMovements([]);
    }
  };

  useEffect(() => {
    if (
      !isRunning ||
      (!hasRuntimeKeyboardMovements && !hasPlayingRuntimeAnimations)
    ) {
      return;
    }

    const pressedKeys = new Set<ArrowDirection>();
    let animationFrame: number | undefined;

    const updateRuntime = (timestamp: number) => {
      const engine = runtimeEngineRef.current;
      if (!engine) {
        return;
      }

      let nextState: RuntimeState | undefined;
      if (pressedKeys.size > 0) {
        nextState = engine.moveWithArrowKeys(pressedKeys);
      }
      nextState = engine.advanceAnimations(timestamp) ?? nextState;
      if (nextState) {
        applyRuntimeStateRef.current(nextState);
      }
    };

    const advanceRuntime = (timestamp: number) => {
      updateRuntime(timestamp);
      if (pressedKeys.size === 0 && !hasPlayingRuntimeAnimations) {
        animationFrame = undefined;
        return;
      }

      animationFrame = window.requestAnimationFrame(advanceRuntime);
    };

    const startMoving = () => {
      if (animationFrame === undefined) {
        animationFrame = window.requestAnimationFrame(advanceRuntime);
      }
    };

    if (hasPlayingRuntimeAnimations) {
      startMoving();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const direction = ARROW_KEY_DIRECTIONS[event.key];
      if (!direction) {
        return;
      }

      event.preventDefault();
      pressedKeys.add(direction);
      startMoving();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const direction = ARROW_KEY_DIRECTIONS[event.key];
      if (direction) {
        pressedKeys.delete(direction);
      }
    };

    const handleWindowBlur = () => {
      pressedKeys.clear();
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      handleWindowBlur();
    };
  }, [
    hasPlayingRuntimeAnimations,
    hasRuntimeKeyboardMovements,
    isRunning,
    runtimeScreenId,
  ]);

  const addScreen = () => {
    if (readOnly) {
      return;
    }
    let nextScreenNumber = screens.length + 1;
    while (screens.some(screen => screen.id === `screen${nextScreenNumber}`)) {
      nextScreenNumber += 1;
    }
    const screen = {
      id: `screen${nextScreenNumber}`,
      name: `Screen ${nextScreenNumber}`,
    };
    setScreens(current => [...current, screen]);
    setActiveScreenId(screen.id);
    setEventScreenId(screen.id);
    setSelectedElementId('');
    setDesignInspectorTab('properties');
  };

  const changeScreen = (screenId: string) => {
    setActiveScreenId(screenId);
    setSelectedElementId(
      elements.find(element => element.screenId === screenId)?.id ?? ''
    );
    setDesignInspectorTab('properties');
  };

  const updateScreen = (screenId: string, changes: Partial<StageScreen>) => {
    if (readOnly) {
      return;
    }
    setScreens(current =>
      current.map(screen =>
        screen.id === screenId ? {...screen, ...changes} : screen
      )
    );
  };

  const renameActiveScreen = (nextScreenId: string) => {
    if (readOnly || nextScreenId === activeScreenId) {
      return;
    }

    const previousScreenId = activeScreenId;
    updateScreen(previousScreenId, {id: nextScreenId});
    setElements(current =>
      current.map(element =>
        element.screenId === previousScreenId
          ? {...element, screenId: nextScreenId}
          : element
      )
    );
    setWorkspaceState(current =>
      renameScreenReferencesInWorkspace(current, previousScreenId, nextScreenId)
    );
    setActiveScreenId(nextScreenId);
    setEventScreenId(current =>
      current === previousScreenId ? nextScreenId : current
    );
    setRuntimeScreenId(current =>
      current === previousScreenId ? nextScreenId : current
    );
  };

  const setDefaultScreen = (screenId: string) => {
    if (readOnly) {
      return;
    }
    setScreens(current =>
      current.map(screen => ({
        ...screen,
        isDefault: screen.id === screenId,
      }))
    );
  };

  const deleteActiveScreen = () => {
    if (!activeScreen || screens.length === 1 || readOnly) {
      return;
    }

    const activeScreenIndex = screens.findIndex(
      screen => screen.id === activeScreen.id
    );
    const nextScreens = screens.filter(screen => screen.id !== activeScreen.id);
    const nextScreen =
      nextScreens[activeScreenIndex] ??
      nextScreens[activeScreenIndex - 1] ??
      nextScreens[0];
    const deletedWasDefault = activeScreen.isDefault === true;
    const nextScreensWithDefault = nextScreens.map(screen => ({
      ...screen,
      isDefault: deletedWasDefault
        ? screen.id === nextScreen.id
        : screen.isDefault === true,
    }));
    const removedElementIds = elements
      .filter(element => element.screenId === activeScreen.id)
      .map(element => element.id);

    setScreens(nextScreensWithDefault);
    setElements(current =>
      current.filter(element => element.screenId !== activeScreen.id)
    );
    setWorkspaceState(current =>
      removeDesignEventsForScreen(current, activeScreen.id, removedElementIds)
    );
    setActiveScreenId(nextScreen.id);
    setEventScreenId(nextScreen.id);
    setSelectedElementId(
      elements.find(element => element.screenId === nextScreen.id)?.id ?? ''
    );
    setOpenEventType(null);
    setDesignInspectorTab('properties');
  };

  const startEditingDesignEvent = (event: DesignEvent) => {
    setEditingEventId(event.id);
    setEventAction(event.action);
    setEventTargetId(event.targetElementId ?? elements[0]?.id ?? '');
    setEventScreenId(event.screenId ?? screens[0]?.id ?? 'screen1');
    setEventModelId(event.modelId ?? mlModels[0]?.id ?? '');
    setEventPrompt(event.prompt ?? 'Write a friendly greeting');
    setEventText(event.text ?? 'Hello!');
    setOpenEventType('click');
  };

  const cancelEventSetup = () => {
    setEditingEventId(null);
    setOpenEventType(null);
  };

  const saveDesignEvent = () => {
    if (!selectedElement || !openEventType || readOnly) {
      return;
    }

    const eventId = editingEventId ?? `design-event-${Date.now()}`;
    const event: DesignEvent = {
      action: eventAction,
      elementId: selectedElement.id,
      eventType: openEventType,
      id: eventId,
      screenId: eventAction === 'goToScreen' ? eventScreenId : undefined,
      modelId: eventAction === 'predictModel' ? eventModelId : undefined,
      prompt: eventAction === 'generateText' ? eventPrompt : undefined,
      targetElementId:
        eventAction === 'changeText' ||
        eventAction === 'predictModel' ||
        eventAction === 'generateText'
          ? eventTargetId
          : undefined,
      text: eventAction === 'changeText' ? eventText : undefined,
    };

    setWorkspaceState(current =>
      editingEventId
        ? updateDesignEventInWorkspace(current, event)
        : appendDesignEventToWorkspace(current, event)
    );
    cancelEventSetup();
  };

  const removeDesignEvent = (eventId: string) => {
    setWorkspaceState(current =>
      removeDesignEventFromWorkspace(current, eventId)
    );
    if (editingEventId === eventId) {
      cancelEventSetup();
    }
  };

  const deleteElement = (elementId: string) => {
    if (readOnly) {
      return;
    }
    setElements(current => current.filter(element => element.id !== elementId));
    setWorkspaceState(current =>
      removeDesignEventsForElement(current, elementId)
    );
    setSelectedElementId(currentSelectedElementId => {
      if (currentSelectedElementId !== elementId) {
        return currentSelectedElementId;
      }
      return (
        elements.find(
          element =>
            element.id !== elementId && element.screenId === activeScreenId
        )?.id ?? ''
      );
    });
  };

  const deleteSelectedElement = () => {
    if (selectedElement) {
      deleteElement(selectedElement.id);
    }
  };

  const handleStageElementDragStart = (
    elementId: string,
    clientX: number,
    clientY: number
  ) => {
    const stageContent = stageContentRef.current;
    const element = document.getElementById(`buildlab-element-${elementId}`);
    if (!stageContent || !element) {
      draggedElementOffset.current = {x: 0, y: 0};
      return;
    }

    const canvasRect = stageContent.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    draggedElementOffset.current = {
      x: ((clientX - elementRect.left) / canvasRect.width) * STAGE_SIZE,
      y: ((clientY - elementRect.top) / canvasRect.height) * STAGE_SIZE,
    };
  };

  const handleStageElementDragEnd = () => {
    draggedElementOffset.current = {x: 0, y: 0};
  };

  const handleStageDrop = (event: DragEvent<HTMLDivElement>) => {
    if (activeTab !== 'design' || isRunning || readOnly) {
      return;
    }

    event.preventDefault();
    const movedElementId = event.dataTransfer.getData(
      'application/buildlab-element-id'
    );
    const newElementKind = event.dataTransfer.getData(
      'application/buildlab-element-kind'
    );

    if (movedElementId) {
      const movedElement = elements.find(
        element => element.id === movedElementId
      );
      updateElement(
        movedElementId,
        stagePosition(
          event.currentTarget,
          event.clientX,
          event.clientY,
          draggedElementOffset.current,
          movedElement && {
            width: movedElement.width,
            height: movedElement.height,
          }
        )
      );
      setSelectedElementId(movedElementId);
      draggedElementOffset.current = {x: 0, y: 0};
      return;
    }

    if (
      newElementKind === 'button' ||
      newElementKind === 'dropdown' ||
      newElementKind === 'label' ||
      newElementKind === 'sprite' ||
      newElementKind === 'textArea' ||
      newElementKind === 'textInput'
    ) {
      addElement(
        newElementKind,
        stagePosition(
          event.currentTarget,
          event.clientX,
          event.clientY,
          NEW_ELEMENT_DROP_OFFSETS[newElementKind],
          DEFAULT_ELEMENT_PROPERTIES[newElementKind]
        )
      );
    }
  };

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Typography component="h1" variant="h4">
            Untitled Build Lab project
          </Typography>
          <Typography className={styles.subtitle} variant="body2">
            Build an app, a game, or something in between.
          </Typography>
        </div>
        <div className={styles.headerActions}>
          <Typography
            aria-live="polite"
            className={styles.saveStatus}
            variant="body2"
          >
            {saveStatus === 'loading' && 'Loading project...'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'unsaved' && 'Unsaved changes'}
            {saveStatus === 'saved' && 'Saved'}
            {saveStatus === 'error' && 'Save failed'}
          </Typography>
          <Typography
            aria-live="polite"
            className={styles.saveStatus}
            variant="body2"
          >
            {shareStatus === 'copied' && 'Link copied'}
            {shareStatus === 'error' && 'Unable to copy link'}
          </Typography>
          <Button disabled={!shareUrl} onClick={handleShare} variant="outlined">
            Share
          </Button>
          <Button
            disabled={saveStatus === 'loading'}
            onClick={toggleRun}
            variant="contained"
          >
            {isRunning ? 'Stop' : 'Run'}
          </Button>
        </div>
      </header>
      <div className={styles.modeToolbar}>
        <SegmentedButtons
          buttons={VIEW_MODES}
          onChange={value => setViewMode(value as ViewMode)}
          selectedButtonValue={viewMode}
          size="xs"
        />
        <Typography className={styles.modeLabel} variant="overline1">
          Workspace
        </Typography>
        <Button
          className={styles.resetLayout}
          disabled={workspaceRatio === DEFAULT_WORKSPACE_RATIO}
          onClick={() => setWorkspaceRatio(DEFAULT_WORKSPACE_RATIO)}
          size="small"
          variant="text"
        >
          Reset layout
        </Button>
      </div>
      <nav aria-label="Build Lab sections" className={styles.tabs}>
        <Tabs
          defaultSelectedTabValue={activeTab}
          hidePanels
          name="buildlab-tabs"
          onChange={value => setActiveTab(value as Tab)}
          tabs={TABS}
          type="secondary"
        />
      </nav>
      <div
        className={`${styles.layout} ${
          viewMode === 'workspace'
            ? styles.workspaceOnly
            : viewMode === 'preview'
            ? styles.previewOnly
            : styles.splitLayout
        }`}
        ref={layoutRef}
        style={layoutStyle}
      >
        {showWorkspace && (
          <section
            aria-label={`${activeTab} workspace`}
            className={`${styles.workspacePanel} ${
              readOnly ? styles.readOnly : ''
            }`}
            data-read-only={readOnly || undefined}
          >
            {activeTab === 'build' && (
              <div className={styles.buildPanel}>
                <div className={styles.workspaceHeading}>
                  <div>
                    <Typography component="h2" variant="h6">
                      Blocks
                    </Typography>
                    <Typography variant="body2">
                      Connect blocks to make the stage respond.
                    </Typography>
                  </div>
                </div>
                <BlocklyWorkspace
                  animationOptions={blocklyAnimationOptions}
                  assetOptions={blocklyAssetOptions}
                  elementOptions={blocklyElementOptions}
                  onWorkspaceChange={setWorkspaceState}
                  readOnly={readOnly}
                  screenOptions={blocklyScreenOptions}
                  spriteOptions={blocklySpriteOptions}
                  touchTargetOptions={blocklyTouchTargetOptions}
                  modelOptions={blocklyModelOptions}
                  workspaceState={workspaceState}
                />
              </div>
            )}
            {activeTab === 'design' && (
              <div className={styles.designPanel}>
                <aside className={styles.elementPalette}>
                  <div className={styles.paletteHeader}>
                    <Typography component="h2" variant="subtitle1">
                      Add elements
                    </Typography>
                    <Typography variant="body2">
                      Drag the elements into your app.
                    </Typography>
                  </div>
                  <div className={styles.paletteGrid}>
                    <PaletteElement
                      iconName="hand-pointer"
                      kind="button"
                      label="Button"
                      onAdd={addElement}
                    />
                    <PaletteElement
                      iconName="font"
                      kind="label"
                      label="Label"
                      onAdd={addElement}
                    />
                    <PaletteElement
                      iconName="keyboard"
                      kind="textInput"
                      label="Text input"
                      onAdd={addElement}
                    />
                    <PaletteElement
                      iconName="align-left"
                      kind="textArea"
                      label="Text area"
                      onAdd={addElement}
                    />
                    <PaletteElement
                      iconName="list"
                      kind="dropdown"
                      label="Dropdown"
                      onAdd={addElement}
                    />
                    <PaletteElement
                      iconName="image"
                      kind="sprite"
                      label="Sprite"
                      onAdd={addElement}
                    />
                  </div>
                </aside>
                <section className={styles.inspector}>
                  <div className={styles.inspectorHeader}>
                    <div>
                      <Typography component="h2" variant="subtitle1">
                        Design
                      </Typography>
                      <Typography variant="body2">
                        Click an element in the app. Set its properties, or give
                        it behavior in Events.
                      </Typography>
                    </div>
                    <div className={styles.inspectorControls}>
                      <SimpleDropdown
                        className={styles.elementSelector}
                        isLabelVisible={false}
                        items={elementSelectorItems}
                        labelText="Choose element"
                        name="design-element-selector"
                        onChange={event => {
                          setSelectedElementId(event.target.value);
                          setDesignInspectorTab('properties');
                        }}
                        selectedValue={selectedElementId}
                        size="s"
                      />
                      <Button
                        aria-controls="buildlab-screen-properties"
                        aria-expanded={showScreenProperties}
                        onClick={() =>
                          setShowScreenProperties(current => !current)
                        }
                        size="small"
                        variant={
                          showScreenProperties ? 'contained' : 'outlined'
                        }
                      >
                        Screen properties
                      </Button>
                    </div>
                  </div>
                  {showScreenProperties && (
                    <section
                      aria-label="Screen properties"
                      className={styles.screenProperties}
                      id="buildlab-screen-properties"
                    >
                      <div className={styles.propertySectionHeading}>
                        <Typography component="h3" variant="subtitle2">
                          Screen
                        </Typography>
                        <Typography variant="body2">
                          Style the current screen.
                        </Typography>
                      </div>
                      <div className={styles.screenPropertyFields}>
                        <TextField
                          label="Name"
                          name="screen-name"
                          onChange={event =>
                            updateScreen(activeScreenId, {
                              name: event.target.value,
                            })
                          }
                          value={activeScreen?.name ?? ''}
                        />
                        <TextField
                          label="ID"
                          name="screen-id"
                          onChange={event =>
                            renameActiveScreen(event.target.value)
                          }
                          value={activeScreen?.id ?? ''}
                        />
                        <SimpleDropdown
                          items={[
                            {text: 'None', value: ''},
                            ...assets
                              .filter(asset => asset.assetType === 'background')
                              .map(asset => ({
                                text: asset.name,
                                value: asset.id,
                              })),
                          ]}
                          labelText="Background image"
                          name="screen-background"
                          onChange={event =>
                            updateScreen(activeScreenId, {
                              backgroundAssetId:
                                event.target.value || undefined,
                            })
                          }
                          selectedValue={activeScreen?.backgroundAssetId ?? ''}
                        />
                        <ColorField
                          label="Background color"
                          value={
                            activeScreen?.backgroundColor ??
                            DEFAULT_SCREEN_BACKGROUND_COLOR
                          }
                          onChange={backgroundColor =>
                            updateScreen(activeScreenId, {backgroundColor})
                          }
                        />
                        <label className={styles.checkboxField}>
                          <input
                            checked={activeScreen?.isDefault === true}
                            name="screen-default"
                            onChange={() => setDefaultScreen(activeScreenId)}
                            type="checkbox"
                          />
                          <span>Default screen</span>
                        </label>
                      </div>
                    </section>
                  )}
                  <Tabs
                    defaultSelectedTabValue={designInspectorTab}
                    hidePanels
                    name="design-inspector-tabs"
                    onChange={value =>
                      setDesignInspectorTab(value as DesignInspectorTab)
                    }
                    tabs={INSPECTOR_TABS}
                    type="secondary"
                  />
                  {selectedElement && designInspectorTab === 'properties' && (
                    <div className={styles.propertyFields}>
                      <TextField
                        label="ID"
                        name="element-id"
                        onChange={event => {
                          const id = event.target.value;
                          updateElement(selectedElement.id, {id});
                          setWorkspaceState(current =>
                            renameElementReferencesInWorkspace(
                              current,
                              selectedElement.id,
                              id
                            )
                          );
                          setSelectedElementId(id);
                        }}
                        value={selectedElement.id}
                      />
                      <TextField
                        label="Class"
                        name="element-class"
                        onChange={event =>
                          updateElement(selectedElement.id, {
                            className: event.target.value.trim() || undefined,
                          })
                        }
                        value={selectedElement.className ?? ''}
                      />
                      <TextField
                        label="Text"
                        name="element-text"
                        onChange={event =>
                          updateElement(selectedElement.id, {
                            label: event.target.value,
                          })
                        }
                        value={selectedElement.label}
                      />
                      {selectedElement.kind === 'sprite' && (
                        <SimpleDropdown
                          items={[
                            {text: 'No image', value: ''},
                            ...assets
                              .filter(asset => asset.assetType !== 'background')
                              .map(asset => ({
                                text: `${asset.name} (${asset.assetType})`,
                                value: asset.id,
                              })),
                          ]}
                          labelText="Sprite image"
                          name="sprite-costume"
                          onChange={event =>
                            updateElement(selectedElement.id, {
                              assetId: event.target.value,
                            })
                          }
                          selectedValue={selectedElement.assetId ?? ''}
                        />
                      )}
                      {selectedElement.kind === 'sprite' && (
                        <SpriteDataEditor
                          models={mlModels}
                          onChange={data =>
                            updateElement(selectedElement.id, {data})
                          }
                          sprite={selectedElement}
                        />
                      )}
                      <div className={styles.positionFields}>
                        <TextField
                          inputType="number"
                          label="X"
                          name="element-x"
                          onChange={event =>
                            updateElement(selectedElement.id, {
                              x: snapCoordinate(
                                Number(event.target.value),
                                selectedElement.width
                              ),
                            })
                          }
                          value={selectedElement.x}
                        />
                        <TextField
                          inputType="number"
                          label="Y"
                          name="element-y"
                          onChange={event =>
                            updateElement(selectedElement.id, {
                              y: snapCoordinate(
                                Number(event.target.value),
                                selectedElement.height
                              ),
                            })
                          }
                          value={selectedElement.y}
                        />
                      </div>
                      {selectedElement.kind === 'button' && (
                        <SimpleDropdown
                          items={[
                            {text: 'No image', value: ''},
                            ...assets
                              .filter(asset => asset.assetType !== 'background')
                              .map(asset => ({
                                text: `${asset.name} (${asset.assetType})`,
                                value: asset.id,
                              })),
                          ]}
                          labelText="Image"
                          name="button-image"
                          onChange={event =>
                            updateElement(selectedElement.id, {
                              imageAssetId: event.target.value || undefined,
                            })
                          }
                          selectedValue={selectedElement.imageAssetId ?? ''}
                        />
                      )}
                      {selectedElement.kind === 'button' &&
                        selectedElement.imageAssetId && (
                          <ColorField
                            label="Icon color"
                            value={
                              selectedElement.iconColor ??
                              selectedElementDefaults?.iconColor ??
                              '#000000'
                            }
                            onChange={iconColor =>
                              updateElement(selectedElement.id, {iconColor})
                            }
                          />
                        )}
                      <div className={styles.propertySection}>
                        <Typography component="h3" variant="subtitle2">
                          Size and style
                        </Typography>
                        <div className={styles.positionFields}>
                          <TextField
                            inputType="number"
                            label="Width"
                            name="element-width"
                            onChange={event =>
                              updateElement(selectedElement.id, {
                                width: Math.max(1, Number(event.target.value)),
                              })
                            }
                            value={
                              selectedElement.width ??
                              selectedElementDefaults?.width ??
                              0
                            }
                          />
                          <TextField
                            inputType="number"
                            label="Height"
                            name="element-height"
                            onChange={event =>
                              updateElement(selectedElement.id, {
                                height: Math.max(1, Number(event.target.value)),
                              })
                            }
                            value={
                              selectedElement.height ??
                              selectedElementDefaults?.height ??
                              0
                            }
                          />
                          <TextField
                            inputType="number"
                            label="Border width"
                            name="element-border-width"
                            onChange={event =>
                              updateElement(selectedElement.id, {
                                borderWidth: Math.max(
                                  0,
                                  Number(event.target.value)
                                ),
                              })
                            }
                            value={
                              selectedElement.borderWidth ??
                              selectedElementDefaults?.borderWidth ??
                              0
                            }
                          />
                          <TextField
                            inputType="number"
                            label="Border radius"
                            name="element-border-radius"
                            onChange={event =>
                              updateElement(selectedElement.id, {
                                borderRadius: Math.max(
                                  0,
                                  Number(event.target.value)
                                ),
                              })
                            }
                            value={
                              selectedElement.borderRadius ??
                              selectedElementDefaults?.borderRadius ??
                              0
                            }
                          />
                        </div>
                        <ColorField
                          label="Text color"
                          value={
                            selectedElement.textColor ??
                            selectedElementDefaults?.textColor ??
                            '#1f2933'
                          }
                          onChange={textColor =>
                            updateElement(selectedElement.id, {textColor})
                          }
                        />
                        <ColorField
                          allowTransparent
                          label="Background color"
                          value={
                            selectedElement.backgroundColor ??
                            selectedElementDefaults?.backgroundColor ??
                            'transparent'
                          }
                          onChange={backgroundColor =>
                            updateElement(selectedElement.id, {
                              backgroundColor,
                            })
                          }
                        />
                        {selectedElement.kind !== 'sprite' && (
                          <>
                            <SimpleDropdown
                              items={FONT_FAMILY_OPTIONS}
                              labelText="Font family"
                              name="element-font-family"
                              onChange={event =>
                                updateElement(selectedElement.id, {
                                  fontFamily: event.target.value,
                                })
                              }
                              selectedValue={
                                selectedElement.fontFamily ??
                                selectedElementDefaults?.fontFamily ??
                                'Arial'
                              }
                            />
                            <TextField
                              inputType="number"
                              label="Font size"
                              name="element-font-size"
                              onChange={event =>
                                updateElement(selectedElement.id, {
                                  fontSize: Math.max(
                                    1,
                                    Number(event.target.value)
                                  ),
                                })
                              }
                              value={
                                selectedElement.fontSize ??
                                selectedElementDefaults?.fontSize ??
                                16
                              }
                            />
                            <SimpleDropdown
                              items={TEXT_ALIGNMENT_OPTIONS}
                              labelText="Text alignment"
                              name="element-text-align"
                              onChange={event =>
                                updateElement(selectedElement.id, {
                                  textAlign: event.target
                                    .value as TextAlignment,
                                })
                              }
                              selectedValue={
                                selectedElement.textAlign ??
                                selectedElementDefaults?.textAlign ??
                                'left'
                              }
                            />
                          </>
                        )}
                        {selectedElement.kind === 'sprite' && (
                          <SimpleDropdown
                            items={OBJECT_FIT_OPTIONS}
                            labelText="Fit image"
                            name="sprite-object-fit"
                            onChange={event =>
                              updateElement(selectedElement.id, {
                                objectFit: event.target.value as ObjectFit,
                              })
                            }
                            selectedValue={
                              selectedElement.objectFit ??
                              selectedElementDefaults?.objectFit ??
                              'contain'
                            }
                          />
                        )}
                        <ColorField
                          allowTransparent
                          label="Border color"
                          value={
                            selectedElement.borderColor ??
                            selectedElementDefaults?.borderColor ??
                            'transparent'
                          }
                          onChange={borderColor =>
                            updateElement(selectedElement.id, {borderColor})
                          }
                        />
                        <label className={styles.checkboxField}>
                          <input
                            checked={selectedElement.visible === false}
                            name="element-hidden"
                            onChange={event =>
                              updateElement(selectedElement.id, {
                                visible: !event.target.checked,
                              })
                            }
                            type="checkbox"
                          />
                          <span>Hidden</span>
                        </label>
                        <Typography component="h4" variant="body2">
                          Layering
                        </Typography>
                        <div className={styles.zOrderControls}>
                          <Button
                            disabled={
                              activeScreenElements[0]?.id === selectedElement.id
                            }
                            onClick={() =>
                              changeElementOrder(selectedElement.id, 'back')
                            }
                            size="small"
                            variant="outlined"
                          >
                            Send to back
                          </Button>
                          <Button
                            disabled={
                              activeScreenElements[
                                activeScreenElements.length - 1
                              ]?.id === selectedElement.id
                            }
                            onClick={() =>
                              changeElementOrder(selectedElement.id, 'front')
                            }
                            size="small"
                            variant="outlined"
                          >
                            Bring to front
                          </Button>
                          <Button
                            disabled={
                              activeScreenElements[0]?.id === selectedElement.id
                            }
                            onClick={() =>
                              changeElementOrder(selectedElement.id, 'backward')
                            }
                            size="small"
                            variant="outlined"
                          >
                            Send backward
                          </Button>
                          <Button
                            disabled={
                              activeScreenElements[
                                activeScreenElements.length - 1
                              ]?.id === selectedElement.id
                            }
                            onClick={() =>
                              changeElementOrder(selectedElement.id, 'forward')
                            }
                            size="small"
                            variant="outlined"
                          >
                            Bring forward
                          </Button>
                        </div>
                      </div>
                      <Button
                        className={styles.deleteElementButton}
                        color="error"
                        onClick={deleteSelectedElement}
                        variant="outlined"
                      >
                        Delete element
                      </Button>
                    </div>
                  )}
                  {selectedElement && designInspectorTab === 'events' && (
                    <div className={styles.eventsPanel}>
                      <Typography component="h3" variant="subtitle1">
                        What {selectedElement.id} already does
                      </Typography>
                      {selectedEvents.length === 0 && (
                        <Typography variant="body2">
                          Nothing yet. This element does not respond to the
                          student.
                        </Typography>
                      )}
                      {selectedEvents.map(designEvent => (
                        <article
                          className={styles.liveEventCard}
                          key={designEvent.id}
                        >
                          <div className={styles.eventCardHeading}>
                            <Typography component="h4" variant="subtitle2">
                              When {designEvent.elementId} is clicked
                            </Typography>
                            <span className={styles.eventStatus}>
                              In your code
                            </span>
                          </div>
                          <Typography variant="body2">
                            {eventActionSummary(designEvent, elements, screens)}
                          </Typography>
                          <pre className={styles.eventCodePreview}>
                            {eventCodePreview(designEvent)}
                          </pre>
                          <div className={styles.eventActions}>
                            <Button
                              onClick={() => setActiveTab('build')}
                              size="small"
                              variant="outlined"
                            >
                              Show in code
                            </Button>
                            <Button
                              onClick={() =>
                                startEditingDesignEvent(designEvent)
                              }
                              size="small"
                              variant="outlined"
                            >
                              Edit
                            </Button>
                            <Button
                              color="error"
                              onClick={() => removeDesignEvent(designEvent.id)}
                              size="small"
                              variant="text"
                            >
                              Remove
                            </Button>
                          </div>
                        </article>
                      ))}
                      <Typography component="h3" variant="subtitle1">
                        Add behavior
                      </Typography>
                      <article className={styles.eventCard}>
                        <div className={styles.eventCardHeading}>
                          <div>
                            <Typography component="h4" variant="subtitle2">
                              Click
                            </Typography>
                            <Typography variant="body2">
                              Triggered when this element is clicked or tapped.
                            </Typography>
                          </div>
                          {openEventType !== 'click' && (
                            <Button
                              onClick={() => {
                                setEditingEventId(null);
                                setOpenEventType('click');
                              }}
                              size="small"
                              variant="outlined"
                            >
                              Set this up
                            </Button>
                          )}
                        </div>
                        {openEventType === 'click' && (
                          <div className={styles.eventSetup}>
                            <Typography
                              className={styles.eventSentence}
                              variant="body2"
                            >
                              When {selectedElement.id} is clicked, do
                            </Typography>
                            <SimpleDropdown
                              isLabelVisible={false}
                              items={EVENT_ACTIONS}
                              labelText="Event action"
                              name="event-action"
                              onChange={event =>
                                setEventAction(
                                  event.target.value as EventAction
                                )
                              }
                              selectedValue={eventAction}
                            />
                            {eventAction === 'changeText' ? (
                              <>
                                <SimpleDropdown
                                  isLabelVisible={false}
                                  items={elements.map(element => ({
                                    text: element.id,
                                    value: element.id,
                                  }))}
                                  labelText="Element to update"
                                  name="event-target"
                                  onChange={event =>
                                    setEventTargetId(event.target.value)
                                  }
                                  selectedValue={eventTargetId}
                                />
                                <TextField
                                  label="Text to set"
                                  name="event-text"
                                  onChange={event =>
                                    setEventText(event.target.value)
                                  }
                                  value={eventText}
                                />
                              </>
                            ) : eventAction === 'predictModel' ? (
                              <>
                                <SimpleDropdown
                                  isLabelVisible={false}
                                  items={mlModels.map(model => ({
                                    text: model.name,
                                    value: model.id,
                                  }))}
                                  labelText="Model to use"
                                  name="event-model"
                                  onChange={event =>
                                    setEventModelId(event.target.value)
                                  }
                                  selectedValue={eventModelId}
                                />
                                <SimpleDropdown
                                  isLabelVisible={false}
                                  items={elements.map(element => ({
                                    text: element.id,
                                    value: element.id,
                                  }))}
                                  labelText="Element to show result"
                                  name="event-result"
                                  onChange={event =>
                                    setEventTargetId(event.target.value)
                                  }
                                  selectedValue={eventTargetId}
                                />
                                {mlModels.length === 0 && (
                                  <Typography variant="body2">
                                    Import a model before adding a prediction
                                    behavior.
                                  </Typography>
                                )}
                              </>
                            ) : eventAction === 'generateText' ? (
                              <>
                                <TextField
                                  label="Prompt for AI"
                                  name="event-prompt"
                                  onChange={event =>
                                    setEventPrompt(event.target.value)
                                  }
                                  value={eventPrompt}
                                />
                                <SimpleDropdown
                                  isLabelVisible={false}
                                  items={elements.map(element => ({
                                    text: element.id,
                                    value: element.id,
                                  }))}
                                  labelText="Element to show result"
                                  name="event-result"
                                  onChange={event =>
                                    setEventTargetId(event.target.value)
                                  }
                                  selectedValue={eventTargetId}
                                />
                              </>
                            ) : (
                              <SimpleDropdown
                                isLabelVisible={false}
                                items={screens.map(screen => ({
                                  text: screen.name,
                                  value: screen.id,
                                }))}
                                labelText="Screen to show"
                                name="event-screen"
                                onChange={event =>
                                  setEventScreenId(event.target.value)
                                }
                                selectedValue={eventScreenId}
                              />
                            )}
                            <div>
                              <Typography variant="body2">
                                {editingEventId
                                  ? 'This block will replace the existing event in your code.'
                                  : 'This block goes into your code. Nothing is added yet.'}
                              </Typography>
                              <pre className={styles.eventCodePreview}>
                                {eventCodePreview({
                                  action: eventAction,
                                  elementId: selectedElement.id,
                                  eventType: 'click',
                                  id: 'preview',
                                  screenId:
                                    eventAction === 'goToScreen'
                                      ? eventScreenId
                                      : undefined,
                                  modelId:
                                    eventAction === 'predictModel'
                                      ? eventModelId
                                      : undefined,
                                  prompt:
                                    eventAction === 'generateText'
                                      ? eventPrompt
                                      : undefined,
                                  targetElementId:
                                    eventAction === 'changeText' ||
                                    eventAction === 'predictModel' ||
                                    eventAction === 'generateText'
                                      ? eventTargetId
                                      : undefined,
                                  text:
                                    eventAction === 'changeText'
                                      ? eventText
                                      : undefined,
                                })}
                              </pre>
                            </div>
                            <div className={styles.eventActions}>
                              <Button
                                disabled={
                                  (eventAction === 'predictModel' &&
                                    (!eventModelId || mlModels.length === 0)) ||
                                  (eventAction === 'generateText' &&
                                    (!eventPrompt.trim() || !eventTargetId))
                                }
                                onClick={saveDesignEvent}
                                variant="contained"
                              >
                                {editingEventId
                                  ? 'Save changes'
                                  : 'Add to my app'}
                              </Button>
                              <Button onClick={cancelEventSetup} variant="text">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </article>
                    </div>
                  )}
                  {!selectedElement && (
                    <div className={styles.propertyFields}>
                      <Typography variant="body2">
                        Select an element on this screen to edit it.
                      </Typography>
                    </div>
                  )}
                </section>
              </div>
            )}
            {activeTab === 'create' && (
              <div className={styles.createPanel}>
                <aside aria-label="Asset library" className={styles.assetRail}>
                  <div className={styles.assetLibraryHeader}>
                    <Typography component="h2" variant="subtitle1">
                      Assets
                    </Typography>
                    <Typography variant="body2">
                      Build the images your project uses.
                    </Typography>
                  </div>
                  <SimpleDropdown
                    items={ASSET_TYPES}
                    labelText="Asset type"
                    name="asset-type"
                    onChange={event =>
                      changeAssetType(event.target.value as AssetType)
                    }
                    selectedValue={activeAssetType}
                  />
                  <Button
                    className={styles.newAssetButton}
                    onClick={addAsset}
                    startIcon={<FontAwesomeV6Icon iconName="plus" />}
                    variant="outlined"
                  >
                    New {activeAssetType}
                  </Button>
                  <div className={styles.assetLibraryHeading}>
                    <Typography component="h3" variant="subtitle2">
                      {activeAssetType === 'costume'
                        ? 'Costumes'
                        : activeAssetType === 'animation'
                        ? 'Animations'
                        : 'Backgrounds'}
                    </Typography>
                    <Typography variant="body2">
                      {visibleAssets.length}
                    </Typography>
                  </div>
                  {visibleAssets.map(asset => {
                    const imageUrl = getAssetImageUrl(asset);
                    return (
                      <button
                        aria-pressed={asset.id === selectedAsset?.id}
                        className={styles.assetButton}
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                        type="button"
                      >
                        <span className={styles.assetThumbnail}>
                          {imageUrl ? (
                            <img
                              alt=""
                              className={styles.assetImage}
                              src={imageUrl}
                            />
                          ) : (
                            <span
                              className={`${styles.assetArt} ${
                                styles[asset.style]
                              }`}
                            />
                          )}
                        </span>
                        <span className={styles.assetButtonMeta}>
                          <span>{asset.name}</span>
                          <span className={styles.assetButtonKind}>
                            {asset.assetType}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </aside>
                <section className={styles.artboard}>
                  <div className={styles.artboardHeading}>
                    <div>
                      <Typography component="h2" variant="h6">
                        Create
                      </Typography>
                      <Typography variant="body2">
                        Draw pixel art, backgrounds, and animation frames.
                      </Typography>
                    </div>
                    <Typography variant="body2">
                      {visibleAssets.length} {activeAssetType}
                      {visibleAssets.length === 1 ? '' : 's'}
                    </Typography>
                  </div>
                  {selectedAsset ? (
                    <AssetEditor
                      asset={selectedAsset}
                      onDelete={deleteAsset}
                      onSave={saveAsset}
                    />
                  ) : (
                    <div className={styles.emptyAssetEditor}>
                      <Typography component="h3" variant="h6">
                        No {activeAssetType}s yet
                      </Typography>
                      <Typography variant="body2">
                        Create an asset to start drawing.
                      </Typography>
                      <Button
                        onClick={addAsset}
                        startIcon={<FontAwesomeV6Icon iconName="plus" />}
                        variant="contained"
                      >
                        New {activeAssetType}
                      </Button>
                    </div>
                  )}
                </section>
              </div>
            )}
            {activeTab === 'data' && (
              <div className={styles.dataPanel}>
                <div className={styles.dataHeading}>
                  <div>
                    <Typography component="h2" variant="h6">
                      Project data
                    </Typography>
                    <Typography variant="body2">
                      Store records and small pieces of project state.
                    </Typography>
                  </div>
                  <div className={styles.dataHeadingActions}>
                    <Button
                      disabled={readOnly}
                      onClick={() => setIsModelManagerOpen(true)}
                      startIcon={<FontAwesomeV6Icon iconName="brain" />}
                      variant="outlined"
                    >
                      Manage ML models
                    </Button>
                  </div>
                </div>
                <Tabs
                  defaultSelectedTabValue={dataSection}
                  hidePanels
                  name="data-tabs"
                  onChange={value => setDataSection(value as DataSection)}
                  tabs={DATA_TABS}
                  type="secondary"
                />
                {dataSection === 'tables' && (
                  <div className={styles.dataWorkspace}>
                    <aside className={styles.dataTableRail}>
                      <Typography component="h3" variant="subtitle1">
                        Tables
                      </Typography>
                      <div className={styles.newTableControls}>
                        <TextField
                          label="Table name"
                          name="new-data-table"
                          onChange={event =>
                            setNewDataTableName(event.target.value)
                          }
                          placeholder="e.g. Scores"
                          value={newDataTableName}
                        />
                        <Button onClick={addDataTable} variant="contained">
                          Add table
                        </Button>
                      </div>
                      <div className={styles.dataTableList}>
                        {dataTables.map(table => (
                          <button
                            aria-pressed={table.id === selectedDataTable?.id}
                            className={styles.dataTableSelector}
                            key={table.id}
                            onClick={() => {
                              setSelectedDataTableId(table.id);
                              setEditingRowId(null);
                            }}
                            type="button"
                          >
                            {table.name}
                          </button>
                        ))}
                      </div>
                    </aside>
                    {selectedDataTable && (
                      <section className={styles.dataEditor}>
                        <div className={styles.dataEditorHeading}>
                          <div>
                            <Typography component="h3" variant="subtitle1">
                              {selectedDataTable.name}
                            </Typography>
                            <Typography variant="body2">
                              {selectedDataTable.rows.length} records
                            </Typography>
                          </div>
                          <Button
                            color="error"
                            onClick={deleteDataTable}
                            size="small"
                            variant="outlined"
                          >
                            Delete table
                          </Button>
                        </div>
                        <div className={styles.addColumnControls}>
                          <TextField
                            label="New column"
                            name="new-column"
                            onChange={event =>
                              setNewColumnName(event.target.value)
                            }
                            placeholder="e.g. score"
                            value={newColumnName}
                          />
                          <Button onClick={addColumn} variant="outlined">
                            Add column
                          </Button>
                        </div>
                        <div className={styles.dataTableScroll}>
                          <table className={styles.dataTable}>
                            <thead>
                              <tr>
                                <th scope="col">id</th>
                                {selectedDataTable.columns.map(column => (
                                  <th key={column.id} scope="col">
                                    <TextField
                                      label={`Column ${column.name}`}
                                      name={`column-${column.id}`}
                                      onChange={event =>
                                        renameColumn(
                                          column.id,
                                          event.target.value
                                        )
                                      }
                                      value={column.name}
                                    />
                                    <Button
                                      disabled={
                                        selectedDataTable.columns.length === 1
                                      }
                                      onClick={() => deleteColumn(column.id)}
                                      size="small"
                                      variant="text"
                                    >
                                      Remove
                                    </Button>
                                  </th>
                                ))}
                                <th scope="col">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className={styles.newDataRow}>
                                <td>New</td>
                                {selectedDataTable.columns.map(column => (
                                  <td key={column.id}>
                                    <TextField
                                      label={`New ${column.name}`}
                                      name={`new-row-${column.id}`}
                                      onChange={event =>
                                        setNewRowValues(current => ({
                                          ...current,
                                          [column.id]: event.target.value,
                                        }))
                                      }
                                      value={newRowValues[column.id] ?? ''}
                                    />
                                  </td>
                                ))}
                                <td>
                                  <Button
                                    onClick={addDataRow}
                                    size="small"
                                    variant="contained"
                                  >
                                    Add row
                                  </Button>
                                </td>
                              </tr>
                              {selectedDataTable.rows.map(row => {
                                const isEditing = editingRowId === row.id;
                                return (
                                  <tr key={row.id}>
                                    <td>{row.id.split('-').pop()}</td>
                                    {selectedDataTable.columns.map(column => (
                                      <td key={column.id}>
                                        {isEditing ? (
                                          <TextField
                                            label={`${column.name} value`}
                                            name={`${row.id}-${column.id}`}
                                            onChange={event =>
                                              setEditingRowValues(current => ({
                                                ...current,
                                                [column.id]: event.target.value,
                                              }))
                                            }
                                            value={
                                              editingRowValues[column.id] ?? ''
                                            }
                                          />
                                        ) : (
                                          row.values[column.id] ?? ''
                                        )}
                                      </td>
                                    ))}
                                    <td className={styles.rowActions}>
                                      {isEditing ? (
                                        <Button
                                          onClick={saveDataRow}
                                          size="small"
                                          variant="contained"
                                        >
                                          Save
                                        </Button>
                                      ) : (
                                        <Button
                                          onClick={() => {
                                            setEditingRowId(row.id);
                                            setEditingRowValues(row.values);
                                          }}
                                          size="small"
                                          variant="outlined"
                                        >
                                          Edit
                                        </Button>
                                      )}
                                      <Button
                                        color="error"
                                        onClick={() =>
                                          setDataTables(current =>
                                            current.map(table =>
                                              table.id === selectedDataTable.id
                                                ? {
                                                    ...table,
                                                    rows: table.rows.filter(
                                                      currentRow =>
                                                        currentRow.id !== row.id
                                                    ),
                                                  }
                                                : table
                                            )
                                          )
                                        }
                                        size="small"
                                        variant="text"
                                      >
                                        Delete
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}
                  </div>
                )}
                {dataSection === 'keyValues' && (
                  <section className={styles.keyValueEditor}>
                    <div className={styles.addKeyValueControls}>
                      <TextField
                        label="Key"
                        name="new-key"
                        onChange={event => setNewKey(event.target.value)}
                        placeholder="e.g. highScore"
                        value={newKey}
                      />
                      <TextField
                        label="Value"
                        name="new-value"
                        onChange={event => setNewValue(event.target.value)}
                        placeholder="e.g. 100"
                        value={newValue}
                      />
                      <Button onClick={addKeyValuePair} variant="contained">
                        Add pair
                      </Button>
                    </div>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th scope="col">Key</th>
                          <th scope="col">Value</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keyValuePairs.map(pair => {
                          const isEditing = editingKeyValueId === pair.id;
                          return (
                            <tr key={pair.id}>
                              <td>
                                {isEditing ? (
                                  <TextField
                                    label="Key"
                                    name={`${pair.id}-key`}
                                    onChange={event =>
                                      setEditingKeyValue(current => ({
                                        ...current,
                                        key: event.target.value,
                                      }))
                                    }
                                    value={editingKeyValue.key}
                                  />
                                ) : (
                                  pair.key
                                )}
                              </td>
                              <td>
                                {isEditing ? (
                                  <TextField
                                    label="Value"
                                    name={`${pair.id}-value`}
                                    onChange={event =>
                                      setEditingKeyValue(current => ({
                                        ...current,
                                        value: event.target.value,
                                      }))
                                    }
                                    value={editingKeyValue.value}
                                  />
                                ) : (
                                  pair.value
                                )}
                              </td>
                              <td className={styles.rowActions}>
                                {isEditing ? (
                                  <Button
                                    onClick={saveKeyValuePair}
                                    size="small"
                                    variant="contained"
                                  >
                                    Save
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      setEditingKeyValueId(pair.id);
                                      setEditingKeyValue({
                                        key: pair.key,
                                        value: pair.value,
                                      });
                                    }}
                                    size="small"
                                    variant="outlined"
                                  >
                                    Edit
                                  </Button>
                                )}
                                <Button
                                  color="error"
                                  onClick={() =>
                                    setKeyValuePairs(current =>
                                      current.filter(
                                        currentPair =>
                                          currentPair.id !== pair.id
                                      )
                                    )
                                  }
                                  size="small"
                                  variant="text"
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </section>
                )}
              </div>
            )}
          </section>
        )}
        {viewMode === 'split' && (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <div
            aria-label="Resize workspace and preview"
            aria-orientation="vertical"
            aria-valuemax={MAX_WORKSPACE_RATIO}
            aria-valuemin={MIN_WORKSPACE_RATIO}
            aria-valuenow={Math.round(workspaceRatio)}
            className={styles.splitDivider}
            onKeyDown={handleDividerKeyDown}
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerCancel={handleDividerPointerUp}
            onPointerUp={handleDividerPointerUp}
            role="separator"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
          >
            <span aria-hidden="true" />
          </div>
        )}
        {showPreview && (
          <aside aria-label="Stage preview" className={styles.previewPanel}>
            <div className={styles.previewHeading}>
              <Typography component="h2" variant="subtitle1">
                {isRunning
                  ? 'Running preview'
                  : activeTab === 'design'
                  ? 'Design canvas'
                  : 'Preview'}
              </Typography>
              {activeTab === 'design' && !isRunning ? (
                <div className={styles.screenControls}>
                  <SimpleDropdown
                    className={styles.screenDropdown}
                    isLabelVisible={false}
                    items={screens.map(screen => ({
                      text: screen.name,
                      value: screen.id,
                    }))}
                    labelText="Current screen"
                    name="current-screen"
                    onChange={event => changeScreen(event.target.value)}
                    selectedValue={activeScreenId}
                    size="s"
                  />
                  <Button onClick={addScreen} size="small" variant="outlined">
                    New screen
                  </Button>
                  <Button
                    color="error"
                    disabled={screens.length === 1 || readOnly}
                    onClick={deleteActiveScreen}
                    size="small"
                    variant="outlined"
                  >
                    Delete screen
                  </Button>
                </div>
              ) : (
                <Typography variant="body2">
                  {STAGE_SIZE} x {STAGE_SIZE}
                </Typography>
              )}
            </div>
            <div
              className={styles.stage}
              style={{
                backgroundColor:
                  displayedScreen?.backgroundColor ??
                  (displayedBackgroundAsset?.style === 'sun'
                    ? '#fff4c2'
                    : displayedBackgroundAsset?.style === 'orbit'
                    ? '#dcecff'
                    : '#d9f4f8'),
                ...(displayedBackgroundImageUrl
                  ? {
                      backgroundImage: `url(${displayedBackgroundImageUrl})`,
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '100% 100%',
                    }
                  : {}),
              }}
            >
              <div className={styles.stageTopBar}>
                {displayedScreen?.name.toUpperCase()}
              </div>
              {/* Palette buttons provide the keyboard alternative to native drag-and-drop. */}
              <div
                aria-label="Design canvas drop area"
                className={styles.stageContent}
                onDragOver={event =>
                  activeTab === 'design' && event.preventDefault()
                }
                onDrop={handleStageDrop}
                ref={stageContentRef}
                role="application"
              >
                <div aria-hidden className={styles.stageBackground} />
                {displayedScreenElements.map(element => (
                  <StageElementView
                    assets={assets}
                    designMode={activeTab === 'design' && !isRunning}
                    element={element}
                    isRunning={isRunning}
                    key={element.id}
                    onActivate={runElementEvent}
                    onDragEnd={handleStageElementDragEnd}
                    onDragStart={handleStageElementDragStart}
                    onValueChange={updateRuntimeElementValue}
                    onSelect={setSelectedElementId}
                    runtimeAnimation={runtimeAnimations[element.id]}
                    selectedElementId={isRunning ? '' : selectedElementId}
                  />
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
      <MlModelManager
        importedModels={mlModels}
        importedModelIds={importedModelIds}
        isOpen={isModelManagerOpen}
        onClose={() => setIsModelManagerOpen(false)}
        onImport={handleImportMlModel}
        onRemove={handleRemoveMlModel}
        providedModels={providedModels}
      />
    </main>
  );
}

function PaletteElement({
  iconName,
  kind,
  label,
  onAdd,
}: {
  iconName: string;
  kind: ElementKind;
  label: string;
  onAdd: (kind: ElementKind) => void;
}) {
  return (
    <button
      className={styles.paletteItem}
      draggable
      onClick={() => onAdd(kind)}
      onDragStart={event => {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('application/buildlab-element-kind', kind);
      }}
      type="button"
    >
      <span aria-hidden className={styles.paletteGlyph}>
        <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
      </span>
      <span>{label}</span>
    </button>
  );
}

function createSeedImageData(width: number, height: number) {
  if (typeof document === 'undefined') {
    return '';
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.toDataURL('image/png');
}

function AssetEditor({
  asset,
  onDelete,
  onSave,
}: {
  asset: Asset;
  onDelete: (assetId: string) => void;
  onSave: (
    assetId: string,
    name: string,
    dataUrl?: string,
    frames?: string[]
  ) => void;
}) {
  const [name, setName] = useState(asset.name);
  const [frame, setFrame] = useState(0);
  const [dataUrl, setDataUrl] = useState(asset.dataUrl);
  const [frames, setFrames] = useState<string[]>(
    asset.frames?.length
      ? asset.frames
      : [asset.dataUrl ?? asset.sourceUrl ?? '']
  );
  const [isDirty, setIsDirty] = useState(false);
  const [pixelEditorRevision, setPixelEditorRevision] = useState(0);
  const pixelEditorRef = useRef<PixelEditorHandle>(null);
  const isAnimation = asset.assetType === 'animation';
  const imageWidth = asset.assetType === 'background' ? 400 : 100;
  const imageHeight = imageWidth;

  useEffect(() => {
    setName(asset.name);
    setDataUrl(asset.dataUrl);
    setFrames(
      asset.frames?.length
        ? asset.frames
        : [asset.dataUrl ?? asset.sourceUrl ?? '']
    );
    setFrame(0);
    setIsDirty(false);
    setPixelEditorRevision(current => current + 1);
  }, [asset]);

  const currentImageData = isAnimation ? frames[frame] : dataUrl;
  const editorImageData =
    currentImageData ||
    getAssetEditorImageUrl(asset) ||
    createSeedImageData(imageWidth, imageHeight);

  const commitCurrentEditorFrame = () => {
    const nextDataUrl = pixelEditorRef.current?.getImage()?.dataURI;
    if (!nextDataUrl) {
      return undefined;
    }
    setIsDirty(true);
    if (!isAnimation) {
      setDataUrl(nextDataUrl);
      return nextDataUrl;
    }
    setFrames(current =>
      current.map((currentFrame, index) =>
        index === frame ? nextDataUrl : currentFrame
      )
    );
    return nextDataUrl;
  };

  const addFrame = () => {
    const currentEditorFrame = commitCurrentEditorFrame();
    setFrames(current => {
      const nextFrames = [
        ...current,
        currentEditorFrame ?? current[frame] ?? '',
      ];
      setFrame(nextFrames.length - 1);
      return nextFrames;
    });
    setIsDirty(true);
  };

  const duplicateFrame = () => {
    const currentEditorFrame = commitCurrentEditorFrame();
    setFrames(current => {
      const nextFrames = currentEditorFrame
        ? current.map((currentFrame, index) =>
            index === frame ? currentEditorFrame : currentFrame
          )
        : [...current];
      nextFrames.splice(frame + 1, 0, nextFrames[frame] ?? '');
      return nextFrames;
    });
    setFrame(current => current + 1);
    setIsDirty(true);
  };

  const removeFrame = () => {
    if (frames.length <= 1) {
      return;
    }
    commitCurrentEditorFrame();
    setFrames(current => current.filter((_, index) => index !== frame));
    setFrame(current => Math.max(0, Math.min(current, frames.length - 2)));
    setIsDirty(true);
  };

  const save = () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      const currentEditorFrame = pixelEditorRef.current?.getImage()?.dataURI;
      const nextDataUrl = currentEditorFrame ?? dataUrl;
      const nextFrames = isAnimation
        ? frames.map((currentFrame, index) =>
            index === frame ? currentEditorFrame ?? currentFrame : currentFrame
          )
        : undefined;
      onSave(
        asset.id,
        trimmedName,
        isAnimation ? undefined : nextDataUrl,
        nextFrames
      );
      setIsDirty(false);
    }
  };

  const revert = () => {
    setName(asset.name);
    setDataUrl(asset.dataUrl);
    setFrames(
      asset.frames?.length
        ? asset.frames
        : [asset.dataUrl ?? asset.sourceUrl ?? '']
    );
    setFrame(0);
    setIsDirty(false);
    setPixelEditorRevision(current => current + 1);
  };

  const selectFrame = (nextFrame: number) => {
    commitCurrentEditorFrame();
    setFrame(nextFrame);
  };

  return (
    <section aria-label={`Edit ${asset.name}`} className={styles.assetEditor}>
      <header className={styles.assetEditorHeader}>
        <div>
          <Typography component="h3" variant="subtitle1">
            Pixel editor
          </Typography>
          <Typography variant="body2">
            {name || asset.name} · {asset.assetType}
          </Typography>
        </div>
        <div className={styles.assetEditorHeaderMeta}>
          <span
            aria-live="polite"
            className={`${styles.editorStatus} ${
              isDirty ? styles.editorStatusDirty : ''
            }`}
          >
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <span className={styles.editorDimensions}>
            {imageWidth} × {imageHeight} px
          </span>
          <button
            aria-label={`Delete ${asset.name}`}
            className={styles.deleteAssetButton}
            onClick={() => onDelete(asset.id)}
            title={`Delete ${asset.name}`}
            type="button"
          >
            <FontAwesomeV6Icon iconName="trash" />
          </button>
        </div>
      </header>
      <div className={styles.assetEditorBody}>
        <div className={styles.assetCanvasColumn}>
          <div className={styles.sharedPixelEditor}>
            <PixelEditorModal
              ref={pixelEditorRef}
              imageUrl={editorImageData}
              inline
              key={`${asset.id}-${frame}-${pixelEditorRevision}`}
              onCancel={() => undefined}
              onSave={() => undefined}
              title={`Edit ${name || asset.name}`}
            />
          </div>
          {isAnimation && (
            <div aria-label="Animation frames" className={styles.frameStrip}>
              <div className={styles.frameStripHeader}>
                <div>
                  <Typography component="h4" variant="subtitle2">
                    Frames
                  </Typography>
                  <Typography variant="body2">
                    Frame {frame + 1} of {frames.length}
                  </Typography>
                </div>
                <Button
                  onClick={addFrame}
                  size="small"
                  startIcon={<FontAwesomeV6Icon iconName="plus" />}
                  variant="outlined"
                >
                  Add frame
                </Button>
              </div>
              <div className={styles.frameList}>
                {frames.map((frameImage, index) => (
                  <button
                    aria-label={`Edit frame ${index + 1}`}
                    aria-pressed={frame === index}
                    className={styles.frameButton}
                    key={`${asset.id}-frame-${index}`}
                    onClick={() => selectFrame(index)}
                    type="button"
                  >
                    <span className={styles.frameThumbnail}>
                      {frameImage ? (
                        <img alt="" src={frameImage} />
                      ) : (
                        <span className={styles.framePlaceholder} />
                      )}
                    </span>
                    <span>Frame {index + 1}</span>
                  </button>
                ))}
              </div>
              <div className={styles.frameActions}>
                <button
                  aria-label="Previous frame"
                  className={styles.frameIconButton}
                  disabled={frame === 0}
                  onClick={() => selectFrame(Math.max(0, frame - 1))}
                  title="Previous frame"
                  type="button"
                >
                  <FontAwesomeV6Icon iconName="arrow-left" />
                </button>
                <button
                  aria-label="Duplicate frame"
                  className={styles.frameIconButton}
                  onClick={duplicateFrame}
                  title="Duplicate frame"
                  type="button"
                >
                  <FontAwesomeV6Icon iconName="copy" />
                </button>
                <button
                  aria-label="Delete frame"
                  className={styles.frameIconButton}
                  disabled={frames.length <= 1}
                  onClick={removeFrame}
                  title="Delete frame"
                  type="button"
                >
                  <FontAwesomeV6Icon iconName="trash" />
                </button>
                <button
                  aria-label="Next frame"
                  className={styles.frameIconButton}
                  disabled={frame === frames.length - 1}
                  onClick={() =>
                    selectFrame(Math.min(frames.length - 1, frame + 1))
                  }
                  title="Next frame"
                  type="button"
                >
                  <FontAwesomeV6Icon iconName="arrow-right" />
                </button>
              </div>
            </div>
          )}
        </div>
        <aside className={styles.assetEditorDetails}>
          <div className={styles.assetDetailsHeading}>
            <Typography component="h4" variant="subtitle2">
              Asset properties
            </Typography>
            <Typography variant="body2">
              Used by sprites and backgrounds in Design.
            </Typography>
          </div>
          <TextField
            label="Name"
            name="asset-name"
            onChange={event => {
              setName(event.target.value);
              setIsDirty(true);
            }}
            value={name}
          />
          <div className={styles.assetMetadata}>
            <span>Type</span>
            <strong>{asset.assetType}</strong>
            <span>Canvas</span>
            <strong>
              {imageWidth} × {imageHeight} px
            </strong>
          </div>
          <div className={styles.assetHint}>
            <FontAwesomeV6Icon iconName="lightbulb" />
            <Typography variant="body2">
              Use the same asset in multiple sprites from the Design tab.
            </Typography>
          </div>
        </aside>
      </div>
      <footer className={styles.assetEditorFooter}>
        <Typography className={styles.editorSaveInfo} variant="body2">
          {isDirty ? 'Changes are ready to save.' : 'Ready to edit.'}
        </Typography>
        <div className={styles.assetEditorActions}>
          <Button
            onClick={revert}
            startIcon={<FontAwesomeV6Icon iconName="rotate-left" />}
            variant="outlined"
          >
            Revert
          </Button>
          <Button
            onClick={save}
            startIcon={<FontAwesomeV6Icon iconName="floppy-disk" />}
            variant="contained"
          >
            Save asset
          </Button>
        </div>
      </footer>
    </section>
  );
}

function StageElementView({
  assets,
  designMode,
  element,
  isRunning,
  onDragEnd,
  onDragStart,
  onValueChange,
  onActivate,
  onSelect,
  runtimeAnimation,
  selectedElementId,
}: {
  assets: Asset[];
  designMode: boolean;
  element: StageElement;
  isRunning: boolean;
  onDragEnd: () => void;
  onDragStart: (elementId: string, clientX: number, clientY: number) => void;
  onValueChange: (elementId: string, value: string) => void;
  onActivate: (elementId: string) => void;
  onSelect: (elementId: string) => void;
  runtimeAnimation?: RuntimeAnimation;
  selectedElementId: string;
}) {
  if (element.visible === false) {
    return null;
  }

  const selected = selectedElementId === element.id ? styles.selected : '';
  const defaults = DEFAULT_ELEMENT_PROPERTIES[element.kind];
  const borderRadius = element.borderRadius ?? defaults.borderRadius;
  const borderWidth = element.borderWidth ?? defaults.borderWidth;
  const positionStyle = {
    '--element-x': `${(element.x / STAGE_SIZE) * 100}%`,
    '--element-y': `${(element.y / STAGE_SIZE) * 100}%`,
    backgroundColor: element.backgroundColor ?? defaults.backgroundColor,
    borderColor: element.borderColor ?? defaults.borderColor,
    borderRadius: borderRadius === undefined ? undefined : `${borderRadius}px`,
    borderStyle: 'solid',
    borderWidth: borderWidth === undefined ? undefined : `${borderWidth}px`,
    boxSizing: 'border-box',
    color: element.textColor ?? defaults.textColor,
    fontFamily: element.fontFamily ?? defaults.fontFamily,
    fontSize: `${element.fontSize ?? defaults.fontSize}px`,
    height: `${element.height ?? defaults.height}px`,
    textAlign: element.textAlign ?? defaults.textAlign,
    width: `${element.width ?? defaults.width}px`,
  } as CSSProperties;
  const sharedProps = {
    className: `${styles.stageElement} ${selected}`,
    draggable: designMode,
    id: `buildlab-element-${element.id}`,
    onClick: () => (isRunning ? onActivate(element.id) : onSelect(element.id)),
    onDragEnd: () => onDragEnd(),
    onDragStart: (event: DragEvent<HTMLElement>) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/buildlab-element-id', element.id);
      onDragStart(element.id, event.clientX, event.clientY);
    },
    style: positionStyle,
  };

  if (element.kind === 'textInput') {
    return (
      <input
        {...sharedProps}
        aria-label={element.label}
        className={`${sharedProps.className} ${styles.stageInput}`}
        onChange={event => onValueChange(element.id, event.target.value)}
        placeholder={element.label}
        readOnly={!isRunning}
        value={element.inputValue ?? ''}
      />
    );
  }

  if (element.kind === 'textArea') {
    return (
      <textarea
        {...sharedProps}
        aria-label={element.label}
        className={`${sharedProps.className} ${styles.stageTextArea}`}
        onChange={event => onValueChange(element.id, event.target.value)}
        placeholder={element.label}
        readOnly={!isRunning}
        value={element.inputValue ?? ''}
      />
    );
  }

  if (element.kind === 'dropdown') {
    const options = element.options ?? ['Option 1', 'Option 2'];
    // Block code can set a value the options no longer offer.
    const value =
      element.inputValue && options.includes(element.inputValue)
        ? element.inputValue
        : options[0] ?? '';

    return (
      <select
        {...sharedProps}
        aria-label={element.label}
        className={`${sharedProps.className} ${styles.stageDropdown}`}
        disabled={!isRunning}
        onChange={event => onValueChange(element.id, event.target.value)}
        value={value}
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (element.kind === 'button') {
    return (
      <button
        {...sharedProps}
        className={`${sharedProps.className} ${styles.stageButton}`}
        type="button"
      >
        {element.imageAssetId && (
          <StageButtonAsset
            asset={assets.find(asset => asset.id === element.imageAssetId)}
            color={element.iconColor ?? defaults.iconColor}
          />
        )}
        <span>{element.label}</span>
      </button>
    );
  }
  if (element.kind === 'sprite') {
    const assignedAsset = assets.find(
      candidate => candidate.id === element.assetId
    );
    const runtimeAsset = runtimeAnimation
      ? assets.find(candidate => candidate.id === runtimeAnimation.assetId)
      : undefined;
    const asset = runtimeAsset ?? assignedAsset;
    const imageUrl =
      runtimeAsset?.frames?.[runtimeAnimation?.frameIndex ?? 0] ||
      (asset ? getAssetImageUrl(asset) : undefined);

    return (
      <button
        {...sharedProps}
        aria-label={`Select ${element.label}`}
        className={`${sharedProps.className} ${styles.stageSprite} ${
          imageUrl
            ? styles.stageSpriteWithImage
            : asset
            ? styles[asset.style]
            : styles.stageSpriteEmpty
        }`}
        type="button"
      >
        {imageUrl && (
          <img
            alt=""
            className={styles.stageSpriteImage}
            src={imageUrl}
            style={{
              objectFit: element.objectFit ?? defaults.objectFit,
            }}
          />
        )}
      </button>
    );
  }
  return (
    <button
      {...sharedProps}
      className={`${sharedProps.className} ${styles.stageLabel}`}
      type="button"
    >
      {element.label}
    </button>
  );
}

function StageButtonAsset({asset, color}: {asset?: Asset; color?: string}) {
  if (!asset) {
    return null;
  }

  const imageUrl = getAssetImageUrl(asset);

  if (imageUrl && color) {
    const maskStyle = {
      backgroundColor: color,
      maskImage: `url(${imageUrl})`,
      maskPosition: 'center',
      maskRepeat: 'no-repeat',
      maskSize: 'contain',
      WebkitMaskImage: `url(${imageUrl})`,
      WebkitMaskPosition: 'center',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskSize: 'contain',
    } as CSSProperties;
    return (
      <span
        aria-hidden="true"
        className={styles.stageButtonAsset}
        style={maskStyle}
      />
    );
  }

  return imageUrl ? (
    <img alt="" className={styles.stageButtonAsset} src={imageUrl} />
  ) : (
    <span
      aria-hidden="true"
      className={`${styles.stageButtonAsset} ${styles[asset.style]}`}
    />
  );
}

function ColorField({
  allowTransparent = false,
  label,
  onChange,
  value,
}: {
  allowTransparent?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const inputId = useId();
  const isHexColor = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value);

  return (
    <div className={styles.colorField}>
      <label htmlFor={inputId}>{label}</label>
      <div className={styles.colorFieldControl}>
        <input
          aria-label={label}
          className={styles.colorInput}
          id={inputId}
          onChange={event => onChange(event.target.value)}
          type="color"
          value={isHexColor ? value : '#ffffff'}
        />
        <span className={styles.colorValue}>{value}</span>
        {allowTransparent && (
          <Button
            onClick={event => {
              event.preventDefault();
              onChange('transparent');
            }}
            size="small"
            variant="text"
          >
            Transparent
          </Button>
        )}
      </div>
    </div>
  );
}
