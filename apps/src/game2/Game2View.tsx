import React, {useCallback, useEffect, useRef, useState} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LabProps} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import CodePanel, {CodePanelHandle} from './CodePanel';
import ImagesPanel from './ImagesPanel';
import PlayPanel from './PlayPanel';
import ThemePanel from './ThemePanel';
import {Game2ImageEntry, Game2Source} from './types';
import WorldPanel, {createEmptyGrid} from './WorldPanel';

import moduleStyles from './game2View.module.scss';

const TABS = ['Description', 'Images', 'World', 'Code', 'Play'] as const;
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
  const [images, setImages] = useState<Game2ImageEntry[]>([]);
  const [grid, setGrid] = useState<boolean[][]>(createEmptyGrid);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocklyRef = useRef<Record<string, any> | undefined>(undefined);
  const gridRef = useRef<boolean[][]>(grid);
  const imagesRef = useRef<Game2ImageEntry[]>(images);
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
    if (parsedInitial.current.images?.length) {
      // Migrate legacy entries that lack a name field.
      const migrated = parsedInitial.current.images.map(img => ({
        ...img,
        name: img.name || img.prompt || img.filename,
      }));
      setImages(migrated);
      imagesRef.current = migrated;
    }
    if (parsedInitial.current.blockly) {
      blocklyRef.current = parsedInitial.current.blockly;
    }
    if (parsedInitial.current.grid?.length) {
      setGrid(parsedInitial.current.grid);
      gridRef.current = parsedInitial.current.grid;
    }
    initializedRef.current = true;
  }, [initialSources]);

  // Save all state to project sources.
  const saveProject = useCallback(
    ({
      updatedImages,
      updatedBlockly,
      updatedGrid,
    }: {
      updatedImages?: Game2ImageEntry[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updatedBlockly?: Record<string, any>;
      updatedGrid?: boolean[][];
    } = {}) => {
      const source: Game2Source = {
        images: updatedImages ?? imagesRef.current,
        blockly: updatedBlockly ?? blocklyRef.current,
        grid: updatedGrid ?? gridRef.current,
      };
      Lab2Registry.getInstance()
        .getProjectManager()
        ?.save({source: JSON.stringify(source)});
    },
    []
  );

  const handleImagesChange = useCallback(
    (updatedImages: Game2ImageEntry[]) => {
      setImages(updatedImages);
      imagesRef.current = updatedImages;
      saveProject({updatedImages});
    },
    [saveProject]
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
    (updatedGrid: boolean[][]) => {
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
          </button>
        ))}
      </div>
      <div className={moduleStyles.tabContent}>
        {activeTab === 'Description' && <ThemePanel />}
        {activeTab === 'Images' && (
          <ImagesPanel
            images={images}
            channelId={channelId}
            onImagesChange={handleImagesChange}
          />
        )}
        {activeTab === 'World' && (
          <WorldPanel grid={grid} onGridChange={handleGridChange} />
        )}
        {activeTab === 'Play' && (
          <PlayPanel
            grid={grid}
            images={images}
            channelId={channelId}
            getCode={getCode}
          />
        )}
        {/* Code panel is always mounted so Blockly workspace persists across tab switches.
            Use visibility instead of display:none so the div retains layout dimensions,
            preventing Blockly from getting stale cached sizes after window resizes. */}
        <div
          style={{
            visibility: activeTab === 'Code' ? 'visible' : 'hidden',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <CodePanel
            ref={codePanelRef}
            visible={activeTab === 'Code'}
            images={images}
            initialBlocks={parsedInitial.current.blockly}
            onBlocksChange={handleBlocksChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Game2View;
