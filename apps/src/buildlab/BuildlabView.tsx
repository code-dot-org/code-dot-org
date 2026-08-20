import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import Tabs from '@code-dot-org/component-library/tabs';
import TextField from '@code-dot-org/component-library/textField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, {useEffect, useMemo, useState} from 'react';

import BlocklyWorkspace, {
  appendDesignEventToWorkspace,
  getDesignEventsFromWorkspace,
  INITIAL_WORKSPACE_STATE,
  removeDesignEventsForElement,
  renameElementReferencesInWorkspace,
  BuildlabBlockState,
  BuildlabDesignEvent,
  BuildlabWorkspaceState,
} from './BlocklyWorkspace';
import InlinePixelEditor from './InlinePixelEditor';

import styles from './buildlab-view.module.scss';

type Tab = 'build' | 'design' | 'create' | 'data';
type DesignInspectorTab = 'properties' | 'events';
type ElementKind = 'button' | 'label' | 'sprite';
type EventAction = BuildlabDesignEvent['action'];
type AssetType = 'costume' | 'animation' | 'background';

interface StageElement {
  assetId?: string;
  id: string;
  kind: ElementKind;
  label: string;
  screenId: string;
  x: number;
  y: number;
}

interface StageScreen {
  id: string;
  name: string;
}

type DesignEvent = BuildlabDesignEvent;

interface Asset {
  assetType: AssetType;
  dataUrl?: string;
  frames?: string[];
  id: string;
  name: string;
  style: 'sun' | 'orbit' | 'wave';
}

type DataSection = 'tables' | 'keyValues';

interface ProjectDataColumn {
  id: string;
  name: string;
}

interface ProjectDataRow {
  id: string;
  values: Record<string, string>;
}

interface ProjectDataTable {
  columns: ProjectDataColumn[];
  id: string;
  name: string;
  rows: ProjectDataRow[];
}

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

const STAGE_SIZE = 400;
const GRID_SIZE = 5;
const TABS = [
  {text: 'Build', value: 'build', tabContent: <></>},
  {text: 'Design', value: 'design', tabContent: <></>},
  {text: 'Create', value: 'create', tabContent: <></>},
  {text: 'Data', value: 'data', tabContent: <></>},
];
const INSPECTOR_TABS = [
  {text: 'Properties', value: 'properties', tabContent: <></>},
  {text: 'Events', value: 'events', tabContent: <></>},
];
const EVENT_ACTIONS = [
  {text: 'Change the text of an element', value: 'changeText'},
  {text: 'Go to another screen', value: 'goToScreen'},
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
const PIXEL_COLORS = [
  {className: 'pixelColorInk', name: 'Ink', value: '#1f2933'},
  {className: 'pixelColorRed', name: 'Red', value: '#d94b4b'},
  {className: 'pixelColorGold', name: 'Gold', value: '#f7be36'},
  {className: 'pixelColorTeal', name: 'Teal', value: '#248da8'},
  {className: 'pixelColorWhite', name: 'White', value: '#ffffff'},
];
const INITIAL_SCREENS: StageScreen[] = [{id: 'screen1', name: 'Screen 1'}];

const INITIAL_ELEMENTS: StageElement[] = [
  {
    id: 'label1',
    kind: 'label',
    label: 'Welcome to Build Lab',
    screenId: 'screen1',
    x: 54,
    y: 64,
  },
  {
    id: 'button1',
    kind: 'button',
    label: 'Start',
    screenId: 'screen1',
    x: 145,
    y: 155,
  },
  {
    assetId: 'orbit',
    id: 'sprite1',
    kind: 'sprite',
    label: 'Orbit',
    screenId: 'screen1',
    x: 162,
    y: 245,
  },
];

const INITIAL_ASSETS: Asset[] = [
  {assetType: 'costume', id: 'orbit', name: 'Orbit', style: 'orbit'},
  {assetType: 'animation', id: 'sun', name: 'Sun cycle', style: 'sun'},
  {assetType: 'costume', id: 'wave', name: 'Wave', style: 'wave'},
  {assetType: 'background', id: 'sky', name: 'Sky', style: 'wave'},
];

const INITIAL_DATA_TABLES: ProjectDataTable[] = [
  {
    columns: [
      {id: 'name', name: 'name'},
      {id: 'score', name: 'score'},
    ],
    id: 'scores',
    name: 'Scores',
    rows: [
      {id: 'scores-row-1', values: {name: 'Avery', score: '12'}},
      {id: 'scores-row-2', values: {name: 'Sam', score: '8'}},
    ],
  },
];

function snapCoordinate(value: number) {
  const snapped = Math.round(value / GRID_SIZE) * GRID_SIZE;
  return Math.max(0, Math.min(STAGE_SIZE - 40, snapped));
}

function stagePosition(
  container: HTMLElement,
  clientX: number,
  clientY: number
) {
  const rect = container.getBoundingClientRect();
  return {
    x: snapCoordinate(((clientX - rect.left) / rect.width) * STAGE_SIZE),
    y: snapCoordinate(((clientY - rect.top) / rect.height) * STAGE_SIZE),
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

  const target = elements.find(element => element.id === event.targetElementId);
  return `Change ${target?.id ?? 'an element'} text to "${event.text ?? ''}"`;
}

function eventCodePreview(event: DesignEvent) {
  const action =
    event.action === 'goToScreen'
      ? `  setScreen(${JSON.stringify(event.screenId)});`
      : `  setText(${JSON.stringify(event.targetElementId)}, ${JSON.stringify(
          event.text ?? ''
        )});`;

  return `onEvent(${JSON.stringify(
    event.elementId
  )}, "click", function() {\n${action}\n});`;
}

interface RuntimeState {
  elements: StageElement[];
  screenId: string;
}

function executeBlockChain(
  firstBlock: BuildlabBlockState | undefined,
  runtimeState: RuntimeState,
  screens: StageScreen[],
  spriteAssetId?: string
): RuntimeState {
  let block = firstBlock;
  let nextState = runtimeState;

  while (block) {
    if (block.type === 'buildlab_set_text') {
      const elementId = String(block.fields?.ELEMENT ?? '');
      const text = String(block.fields?.TEXT ?? '');
      nextState = {
        ...nextState,
        elements: nextState.elements.map(element =>
          element.id === elementId ? {...element, label: text} : element
        ),
      };
    }

    if (block.type === 'buildlab_show_screen') {
      const screenId = String(block.fields?.SCREEN ?? '');
      if (screens.some(screen => screen.id === screenId)) {
        nextState = {...nextState, screenId};
      }
    }

    if (block.type === 'buildlab_create_sprite') {
      const spriteId = `runtime-sprite-${block.id}`;
      if (!nextState.elements.some(element => element.id === spriteId)) {
        nextState = {
          ...nextState,
          elements: [
            ...nextState.elements,
            {
              assetId: spriteAssetId,
              id: spriteId,
              kind: 'sprite',
              label: 'Sprite',
              screenId: nextState.screenId,
              x: snapCoordinate(Number(block.fields?.X ?? 200)),
              y: snapCoordinate(Number(block.fields?.Y ?? 200)),
            },
          ],
        };
      }
    }

    block = block.next?.block;
  }

  return nextState;
}

export default function BuildlabView() {
  const [activeTab, setActiveTab] = useState<Tab>('build');
  const [isRunning, setIsRunning] = useState(false);
  const [runtimeElements, setRuntimeElements] = useState<StageElement[]>([]);
  const [runtimeScreenId, setRuntimeScreenId] = useState('screen1');
  const [designInspectorTab, setDesignInspectorTab] =
    useState<DesignInspectorTab>('properties');
  const [elements, setElements] = useState(INITIAL_ELEMENTS);
  const [selectedElementId, setSelectedElementId] = useState('button1');
  const [screens, setScreens] = useState(INITIAL_SCREENS);
  const [activeScreenId, setActiveScreenId] = useState('screen1');
  const [workspaceState, setWorkspaceState] = useState<BuildlabWorkspaceState>(
    INITIAL_WORKSPACE_STATE
  );
  const [openEventType, setOpenEventType] = useState<'click' | null>(null);
  const [eventAction, setEventAction] = useState<EventAction>('changeText');
  const [eventTargetId, setEventTargetId] = useState('label1');
  const [eventScreenId, setEventScreenId] = useState('screen1');
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState('orbit');
  const [activeAssetType, setActiveAssetType] = useState<AssetType>('costume');
  const [dataSection, setDataSection] = useState<DataSection>('tables');
  const [dataTables, setDataTables] = useState(INITIAL_DATA_TABLES);
  const [selectedDataTableId, setSelectedDataTableId] = useState('scores');
  const [newDataTableName, setNewDataTableName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [newRowValues, setNewRowValues] = useState<Record<string, string>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowValues, setEditingRowValues] = useState<
    Record<string, string>
  >({});
  const [keyValuePairs, setKeyValuePairs] = useState<KeyValuePair[]>([
    {id: 'welcome-message', key: 'welcomeMessage', value: 'Hello, friend!'},
  ]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingKeyValueId, setEditingKeyValueId] = useState<string | null>(
    null
  );
  const [editingKeyValue, setEditingKeyValue] = useState({key: '', value: ''});

  const selectedElement = useMemo(
    () => elements.find(element => element.id === selectedElementId),
    [elements, selectedElementId]
  );
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
  const displayedScreenId = isRunning ? runtimeScreenId : activeScreenId;
  const displayedScreen =
    screens.find(screen => screen.id === displayedScreenId) ?? screens[0];
  const displayedElements = isRunning ? runtimeElements : elements;
  const displayedScreenElements = useMemo(
    () =>
      displayedElements.filter(
        element => element.screenId === displayedScreenId
      ),
    [displayedElements, displayedScreenId]
  );

  const addElement = (kind: ElementKind, position = {x: 150, y: 160}) => {
    if (isRunning) {
      return;
    }

    const count = elements.filter(element => element.kind === kind).length + 1;
    const label =
      kind === 'button'
        ? 'New button'
        : kind === 'label'
        ? 'New label'
        : 'New sprite';
    const element: StageElement = {
      assetId: kind === 'sprite' ? selectedSpriteAssetId : undefined,
      id: `${kind}${count}`,
      kind,
      label,
      screenId: activeScreenId,
      ...position,
    };
    setElements(current => [...current, element]);
    setSelectedElementId(element.id);
    setDesignInspectorTab('properties');
  };

  const updateElement = (id: string, changes: Partial<StageElement>) => {
    setElements(current =>
      current.map(element =>
        element.id === id ? {...element, ...changes} : element
      )
    );
  };

  const addAsset = () => {
    const asset = {
      id: `asset${assets.length + 1}`,
      assetType: activeAssetType,
      name: `${
        activeAssetType === 'animation'
          ? 'Animation'
          : activeAssetType === 'background'
          ? 'Background'
          : 'Costume'
      } ${assets.length + 1}`,
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
    }
  };

  const saveAsset = (
    assetId: string,
    name: string,
    dataUrl?: string,
    frames?: string[]
  ) => {
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

  const addDataTable = () => {
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
    if (!selectedDataTable) {
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
    if (!selectedDataTable) {
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
    if (!selectedDataTable || !name.trim()) {
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
    if (!selectedDataTable || selectedDataTable.columns.length === 1) {
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
            const {[columnId]: _, ...values} = row.values;
            console.log(_);
            return {...row, values};
          }),
        };
      })
    );
  };

  const addDataRow = () => {
    if (!selectedDataTable) {
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
    if (!selectedDataTable || !editingRowId) {
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
    if (!editingKeyValueId || !editingKeyValue.key.trim()) {
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

  const toggleRun = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    const initialScreenId = screens[0]?.id ?? activeScreenId;
    const spriteAssetId = assets.find(
      asset => asset.assetType !== 'background'
    )?.id;
    const initialRuntimeState = workspaceState.blocks.blocks
      .filter(block => block.type === 'buildlab_when_run')
      .reduce<RuntimeState>(
        (runtimeState, block) =>
          executeBlockChain(
            block.next?.block,
            runtimeState,
            screens,
            spriteAssetId
          ),
        {
          elements: elements.map(element => ({...element})),
          screenId: initialScreenId,
        }
      );

    setRuntimeElements(initialRuntimeState.elements);
    setRuntimeScreenId(initialRuntimeState.screenId);
    setIsRunning(true);
  };

  const runElementEvent = (elementId: string) => {
    const spriteAssetId = assets.find(
      asset => asset.assetType !== 'background'
    )?.id;
    const nextRuntimeState = workspaceState.blocks.blocks
      .filter(
        block =>
          block.type === 'buildlab_on_click' &&
          String(block.fields?.ELEMENT ?? '') === elementId
      )
      .reduce<RuntimeState>(
        (runtimeState, block) =>
          executeBlockChain(
            block.next?.block,
            runtimeState,
            screens,
            spriteAssetId
          ),
        {elements: runtimeElements, screenId: runtimeScreenId}
      );

    setRuntimeElements(nextRuntimeState.elements);
    setRuntimeScreenId(nextRuntimeState.screenId);
  };

  const addScreen = () => {
    const screen = {
      id: `screen${screens.length + 1}`,
      name: `Screen ${screens.length + 1}`,
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

  const addDesignEvent = () => {
    if (!selectedElement || !openEventType) {
      return;
    }

    setWorkspaceState(current =>
      appendDesignEventToWorkspace(current, {
        action: eventAction,
        elementId: selectedElement.id,
        eventType: openEventType,
        id: `design-event-${Date.now()}`,
        screenId: eventAction === 'goToScreen' ? eventScreenId : undefined,
        targetElementId:
          eventAction === 'changeText' ? eventTargetId : undefined,
      })
    );
    setOpenEventType(null);
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) {
      return;
    }
    setElements(current =>
      current.filter(element => element.id !== selectedElement.id)
    );
    setWorkspaceState(current =>
      removeDesignEventsForElement(current, selectedElement.id)
    );
    setSelectedElementId(
      elements.find(
        element =>
          element.id !== selectedElement.id &&
          element.screenId === activeScreenId
      )?.id ?? ''
    );
  };

  const handleStageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (activeTab !== 'design' || isRunning) {
      return;
    }

    event.preventDefault();
    const position = stagePosition(
      event.currentTarget,
      event.clientX,
      event.clientY
    );
    const movedElementId = event.dataTransfer.getData(
      'application/buildlab-element-id'
    );
    const newElementKind = event.dataTransfer.getData(
      'application/buildlab-element-kind'
    );

    if (movedElementId) {
      updateElement(movedElementId, position);
      setSelectedElementId(movedElementId);
      return;
    }

    if (
      newElementKind === 'button' ||
      newElementKind === 'label' ||
      newElementKind === 'sprite'
    ) {
      addElement(newElementKind, position);
    }
  };

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <div>
          <Typography component="h1" variant="h4">
            Untitled Build Lab project
          </Typography>
          <Typography className={styles.subtitle} variant="body2">
            Build an app, a game, or something in between.
          </Typography>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outlined">Share</Button>
          <Button onClick={toggleRun} variant="contained">
            {isRunning ? 'Stop' : 'Run'}
          </Button>
        </div>
      </header>
      <nav aria-label="Build Lab sections" className={styles.tabs}>
        <Tabs
          defaultSelectedTabValue={activeTab}
          hidePanels
          name="build-lab-tabs"
          onChange={value => setActiveTab(value as Tab)}
          tabs={TABS}
          type="secondary"
        />
      </nav>
      <div className={styles.layout}>
        <section
          aria-label={`${activeTab} workspace`}
          className={styles.workspacePanel}
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
                onWorkspaceChange={setWorkspaceState}
                workspaceState={workspaceState}
              />
            </div>
          )}
          {activeTab === 'design' && (
            <div className={styles.designPanel}>
              <aside className={styles.elementPalette}>
                <Typography component="h2" variant="h6">
                  UI elements
                </Typography>
                <PaletteElement
                  kind="button"
                  label="Button"
                  onAdd={addElement}
                />
                <PaletteElement kind="label" label="Label" onAdd={addElement} />
                <PaletteElement
                  kind="sprite"
                  label="Sprite"
                  onAdd={addElement}
                />
              </aside>
              <section className={styles.inspector}>
                <Typography component="h2" variant="h6">
                  Inspector
                </Typography>
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
                        items={assets
                          .filter(asset => asset.assetType !== 'background')
                          .map(asset => ({
                            text: `${asset.name} (${asset.assetType})`,
                            value: asset.id,
                          }))}
                        labelText="Sprite image"
                        name="sprite-costume"
                        onChange={event =>
                          updateElement(selectedElement.id, {
                            assetId: event.target.value,
                          })
                        }
                        selectedValue={
                          selectedElement.assetId ?? selectedAssetId
                        }
                      />
                    )}
                    <div className={styles.positionFields}>
                      <TextField
                        inputType="number"
                        label="X"
                        name="element-x"
                        onChange={event =>
                          updateElement(selectedElement.id, {
                            x: snapCoordinate(Number(event.target.value)),
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
                            y: snapCoordinate(Number(event.target.value)),
                          })
                        }
                        value={selectedElement.y}
                      />
                    </div>
                    <Button
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
                        <Button
                          onClick={() => setActiveTab('build')}
                          size="small"
                          variant="outlined"
                        >
                          Show in code
                        </Button>
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
                            onClick={() => setOpenEventType('click')}
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
                              setEventAction(event.target.value as EventAction)
                            }
                            selectedValue={eventAction}
                          />
                          {eventAction === 'changeText' ? (
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
                              This block goes into your code. Nothing is added
                              yet.
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
                                targetElementId:
                                  eventAction === 'changeText'
                                    ? eventTargetId
                                    : undefined,
                                text:
                                  eventAction === 'changeText'
                                    ? 'Hello!'
                                    : undefined,
                              })}
                            </pre>
                          </div>
                          <div className={styles.eventActions}>
                            <Button
                              onClick={addDesignEvent}
                              variant="contained"
                            >
                              Add to my app
                            </Button>
                            <Button
                              onClick={() => setOpenEventType(null)}
                              variant="text"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </article>
                  </div>
                )}
                {!selectedElement && (
                  <Typography variant="body2">
                    Select an element on this screen to edit it.
                  </Typography>
                )}
              </section>
            </div>
          )}
          {activeTab === 'create' && (
            <div className={styles.createPanel}>
              <aside className={styles.assetRail}>
                <SimpleDropdown
                  isLabelVisible={false}
                  items={ASSET_TYPES}
                  labelText="Creatable asset type"
                  name="asset-type"
                  onChange={event =>
                    changeAssetType(event.target.value as AssetType)
                  }
                  selectedValue={activeAssetType}
                />
                <Button onClick={addAsset} variant="outlined">
                  New {activeAssetType}
                </Button>
                {visibleAssets.map(asset => (
                  <button
                    aria-pressed={asset.id === selectedAsset.id}
                    className={styles.assetButton}
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    type="button"
                  >
                    {asset.dataUrl ? (
                      <img
                        alt=""
                        className={styles.assetImage}
                        src={asset.dataUrl}
                      />
                    ) : (
                      <span
                        className={`${styles.assetArt} ${styles[asset.style]}`}
                      />
                    )}
                    <span>{asset.name}</span>
                  </button>
                ))}
              </aside>
              <section className={styles.artboard}>
                <div className={styles.artboardHeading}>
                  <Typography component="h2" variant="h6">
                    Edit {selectedAsset.name}
                  </Typography>
                </div>
                <AssetEditor asset={selectedAsset} onSave={saveAsset} />
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
                                      currentPair => currentPair.id !== pair.id
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
              </div>
            ) : (
              <Typography variant="body2">
                {STAGE_SIZE} x {STAGE_SIZE}
              </Typography>
            )}
          </div>
          <div className={styles.stage}>
            <div className={styles.stageTopBar}>
              {displayedScreen?.name.toUpperCase()}
            </div>
            <div
              className={styles.stageContent}
              onDragOver={event =>
                activeTab === 'design' && event.preventDefault()
              }
              onDrop={handleStageDrop}
            >
              {displayedScreenElements.map(element => (
                <StageElementView
                  assets={assets}
                  designMode={activeTab === 'design' && !isRunning}
                  element={element}
                  isRunning={isRunning}
                  key={element.id}
                  onActivate={runElementEvent}
                  onSelect={setSelectedElementId}
                  selectedElementId={isRunning ? '' : selectedElementId}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function PaletteElement({
  kind,
  label,
  onAdd,
}: {
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
        {kind === 'button' ? '[]' : kind === 'label' ? 'Aa' : 'o'}
      </span>
      <span>{label}</span>
    </button>
  );
}

function AssetEditor({
  asset,
  onSave,
}: {
  asset: Asset;
  onSave: (
    assetId: string,
    name: string,
    dataUrl?: string,
    frames?: string[]
  ) => void;
}) {
  const [name, setName] = useState(asset.name);
  const [activeTool, setActiveTool] = useState<'Draw' | 'Fill' | 'Eraser'>(
    'Draw'
  );
  const [selectedColor, setSelectedColor] = useState(PIXEL_COLORS[0].value);
  const [frame, setFrame] = useState(0);
  const [dataUrl, setDataUrl] = useState(asset.dataUrl);
  const [frames, setFrames] = useState<string[]>(
    asset.frames?.length ? asset.frames : [asset.dataUrl ?? '']
  );
  const isAnimation = asset.assetType === 'animation';

  useEffect(() => {
    setName(asset.name);
    setDataUrl(asset.dataUrl);
    setFrames(asset.frames?.length ? asset.frames : [asset.dataUrl ?? '']);
    setFrame(0);
  }, [asset]);

  const currentImageData = isAnimation ? frames[frame] : dataUrl;
  const seedColor =
    asset.style === 'sun'
      ? '#f7be36'
      : asset.style === 'orbit'
      ? '#4a7fcc'
      : '#48a9c5';

  const updateImage = (nextDataUrl: string) => {
    if (!isAnimation) {
      setDataUrl(nextDataUrl);
      return;
    }
    setFrames(current =>
      current.map((currentFrame, index) =>
        index === frame ? nextDataUrl : currentFrame
      )
    );
  };

  const addFrame = () => {
    setFrames(current => {
      const nextFrames = [...current, current[frame] ?? ''];
      setFrame(nextFrames.length - 1);
      return nextFrames;
    });
  };

  const save = () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      onSave(
        asset.id,
        trimmedName,
        isAnimation ? undefined : dataUrl,
        isAnimation ? frames : undefined
      );
    }
  };

  const revert = () => {
    setName(asset.name);
    setDataUrl(asset.dataUrl);
    setFrames(asset.frames?.length ? asset.frames : [asset.dataUrl ?? '']);
    setFrame(0);
  };

  return (
    <section aria-label={`Edit ${asset.name}`} className={styles.assetEditor}>
      <div className={styles.assetEditorBody}>
        <aside aria-label="Paint tools" className={styles.assetToolRail}>
          {(['Draw', 'Fill', 'Eraser'] as const).map(tool => (
            <Button
              aria-pressed={activeTool === tool}
              className={styles.assetTool}
              key={tool}
              onClick={() => setActiveTool(tool)}
              size="small"
              variant={activeTool === tool ? 'contained' : 'outlined'}
            >
              {tool}
            </Button>
          ))}
        </aside>
        <div
          className={`${styles.assetEditorCanvas} ${
            asset.assetType === 'background'
              ? styles.assetEditorBackgroundCanvas
              : ''
          }`}
        >
          <InlinePixelEditor
            color={selectedColor}
            height={asset.assetType === 'background' ? 20 : 32}
            imageData={currentImageData}
            onChange={updateImage}
            seedColor={seedColor}
            tool={activeTool}
          />
        </div>
        <aside className={styles.assetEditorDetails}>
          <TextField
            label="Name"
            name="asset-name"
            onChange={event => setName(event.target.value)}
            value={name}
          />
          <div className={styles.colorPalette}>
            <Typography component="h3" variant="subtitle2">
              Color
            </Typography>
            <div>
              {PIXEL_COLORS.map(color => (
                <button
                  aria-label={color.name}
                  aria-pressed={selectedColor === color.value}
                  className={`${styles.colorSwatch} ${styles[color.className]}`}
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  type="button"
                />
              ))}
            </div>
          </div>
          <Typography variant="body2">Type: {asset.assetType}</Typography>
          {isAnimation && (
            <div className={styles.frameControls}>
              <Typography component="h3" variant="subtitle2">
                Frames
              </Typography>
              <div>
                <Button
                  disabled={frame === 0}
                  onClick={() => setFrame(current => Math.max(0, current - 1))}
                  size="small"
                  variant="outlined"
                >
                  Previous
                </Button>
                <Typography variant="body2">
                  {frame + 1} of {frames.length}
                </Typography>
                <Button
                  disabled={frame === frames.length - 1}
                  onClick={() =>
                    setFrame(current =>
                      Math.min(frames.length - 1, current + 1)
                    )
                  }
                  size="small"
                  variant="outlined"
                >
                  Next
                </Button>
              </div>
              <Button onClick={addFrame} size="small" variant="outlined">
                Add frame
              </Button>
            </div>
          )}
        </aside>
      </div>
      <footer className={styles.assetEditorFooter}>
        <Button onClick={revert} variant="outlined">
          Revert
        </Button>
        <Button onClick={save} variant="contained">
          Save
        </Button>
      </footer>
    </section>
  );
}

function StageElementView({
  assets,
  designMode,
  element,
  isRunning,
  onActivate,
  onSelect,
  selectedElementId,
}: {
  assets: Asset[];
  designMode: boolean;
  element: StageElement;
  isRunning: boolean;
  onActivate: (elementId: string) => void;
  onSelect: (elementId: string) => void;
  selectedElementId: string;
}) {
  const selected = selectedElementId === element.id ? styles.selected : '';
  const positionStyle = {
    '--element-x': `${element.x}px`,
    '--element-y': `${element.y}px`,
  } as React.CSSProperties;
  const sharedProps = {
    className: `${styles.stageElement} ${selected}`,
    draggable: designMode,
    onClick: () => (isRunning ? onActivate(element.id) : onSelect(element.id)),
    onDragStart: (event: React.DragEvent<HTMLButtonElement>) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/buildlab-element-id', element.id);
    },
    style: positionStyle,
    type: 'button' as const,
  };

  if (element.kind === 'button') {
    return (
      <button
        {...sharedProps}
        className={`${sharedProps.className} ${styles.stageButton}`}
        type="button"
      >
        {element.label}
      </button>
    );
  }
  if (element.kind === 'sprite') {
    const asset =
      assets.find(candidate => candidate.id === element.assetId) ?? assets[0];

    return (
      <button
        {...sharedProps}
        aria-label={`Select ${element.label}`}
        className={`${sharedProps.className} ${styles.stageSprite} ${
          asset.dataUrl ? styles.stageSpriteWithImage : styles[asset.style]
        }`}
        type="button"
      >
        {asset.dataUrl && (
          <img alt="" className={styles.stageSpriteImage} src={asset.dataUrl} />
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
