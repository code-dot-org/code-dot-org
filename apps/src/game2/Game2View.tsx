import React, {useCallback, useEffect, useRef, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LabProps} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import CodePanel, {CodePanelHandle} from './CodePanel';
import {createEmptyGrid} from './gridConstants';
import ItemsPanel from './ItemsPanel';
import PlayPanel from './PlayPanel';
import ThemePanel from './ThemePanel';
import {Game2ItemEntry, Game2Source} from './types';
import WorldPanel from './WorldPanel';

import moduleStyles from './game2View.module.scss';

const TABS = ['Description', 'Items', 'World', 'Code', 'Play'] as const;
type Tab = (typeof TABS)[number];

function parseSource(raw: unknown): Game2Source {
  if (!raw) {
    return {};
  }
  if (typeof raw === 'string') {
    return JSON.parse(raw);
  }
  return raw as Game2Source;
}

const Game2View: React.FunctionComponent<LabProps> = ({initialSources}) => {
  const [activeTab, setActiveTab] = useState<Tab>('Description');
  const [items, setItems] = useState<Game2ItemEntry[]>([]);
  const [grid, setGrid] = useState<string[][]>(createEmptyGrid);
  const [itemGenerating, setItemGenerating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocklyRef = useRef<Record<string, any> | undefined>(undefined);
  const gridRef = useRef<string[][]>(grid);
  const itemsRef = useRef<Game2ItemEntry[]>(items);
  const initializedRef = useRef(false);
  const codePanelRef = useRef<CodePanelHandle>(null);

  const channelId = useAppSelector(state => state.lab.channel?.id) as
    | string
    | undefined;

  // Parse initial sources once.
  const parsedInitial = useRef<Game2Source>({});
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    try {
      parsedInitial.current = parseSource(initialSources?.source);
    } catch {
      parsedInitial.current = {};
    }
    const savedItems = parsedInitial.current.items ?? [];
    if (savedItems.length) {
      setItems(savedItems);
      itemsRef.current = savedItems;
    }
    if (parsedInitial.current.blockly) {
      blocklyRef.current = parsedInitial.current.blockly;
    }
    if (parsedInitial.current.grid?.length) {
      const savedGrid = parsedInitial.current.grid as string[][];
      setGrid(savedGrid);
      gridRef.current = savedGrid;
    }
    initializedRef.current = true;
  }, [initialSources]);

  // Save all state to project sources.
  const saveProject = useCallback(
    ({
      updatedItems,
      updatedBlockly,
      updatedGrid,
    }: {
      updatedItems?: Game2ItemEntry[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updatedBlockly?: Record<string, any>;
      updatedGrid?: string[][];
    } = {}) => {
      const source: Game2Source = {
        items: updatedItems ?? itemsRef.current,
        blockly: updatedBlockly ?? blocklyRef.current,
        grid: updatedGrid ?? gridRef.current,
      };
      Lab2Registry.getInstance()
        .getProjectManager()
        ?.save({source: JSON.stringify(source)});
    },
    []
  );

  const handleItemsChange = useCallback(
    (updatedItems: Game2ItemEntry[]) => {
      setItems(updatedItems);
      itemsRef.current = updatedItems;
      saveProject({updatedItems});
    },
    [saveProject]
  );

  const handleDeleteItem = useCallback(
    (name: string) => {
      const updatedItems = items.filter(img => img.name !== name);
      setItems(updatedItems);
      itemsRef.current = updatedItems;

      // Remove from the grid too.
      const updatedGrid = grid.map(row =>
        row.map(cell => (cell === name ? '' : cell))
      );
      setGrid(updatedGrid);
      gridRef.current = updatedGrid;

      saveProject({updatedItems, updatedGrid});
    },
    [items, grid, saveProject]
  );

  const handleBlocksChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (blocks: Record<string, any>) => {
      blocklyRef.current = blocks;
      saveProject({updatedBlockly: blocks});
    },
    [saveProject]
  );

  const handleGridChange = useCallback(
    (updatedGrid: string[][]) => {
      setGrid(updatedGrid);
      gridRef.current = updatedGrid;
      saveProject({updatedGrid});
    },
    [saveProject]
  );

  const getCode = useCallback(() => {
    return codePanelRef.current?.getCode() ?? '';
  }, []);

  return (
    <div className={moduleStyles.container}>
      <div className={moduleStyles.tabs}>
        {TABS.map(tab => (
          <button
            type="button"
            key={tab}
            className={`${moduleStyles.tab} ${
              activeTab === tab ? moduleStyles.tabActive : ''
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Items' && itemGenerating && (
              <i
                className="fa fa-spinner fa-spin"
                style={{marginLeft: 6, fontSize: 12}}
              />
            )}
          </button>
        ))}
      </div>
      <div className={moduleStyles.tabContent}>
        {activeTab === 'Description' && <ThemePanel />}
        <div style={{display: activeTab === 'Items' ? 'contents' : 'none'}}>
          <ItemsPanel
            items={items}
            channelId={channelId}
            onGeneratingChange={setItemGenerating}
            onItemsChange={handleItemsChange}
            onDeleteItem={handleDeleteItem}
          />
        </div>
        <div style={{display: activeTab === 'World' ? 'contents' : 'none'}}>
          <WorldPanel
            visible={activeTab === 'World'}
            grid={grid}
            items={items}
            channelId={channelId}
            onGridChange={handleGridChange}
          />
        </div>
        <div style={{display: activeTab === 'Play' ? 'contents' : 'none'}}>
          <PlayPanel
            visible={activeTab === 'Play'}
            grid={grid}
            items={items}
            channelId={channelId}
            getCode={getCode}
          />
        </div>
        {/* Code panel is always mounted so Blockly workspace persists across tab switches.
            Use clip-path to hide it — visibility:hidden alone doesn't clip Blockly's
            flyout SVG elements. clip-path:inset(100%) hides everything visually while
            keeping the element in layout flow so Blockly still gets real dimensions. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            clipPath: activeTab === 'Code' ? 'none' : 'inset(100%)',
            pointerEvents: activeTab === 'Code' ? 'auto' : 'none',
          }}
        >
          <CodePanel
            ref={codePanelRef}
            visible={activeTab === 'Code'}
            items={items}
            initialBlocks={parsedInitial.current.blockly}
            onBlocksChange={handleBlocksChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Game2View;
