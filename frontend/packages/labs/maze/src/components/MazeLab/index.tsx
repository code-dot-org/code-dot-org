import Button from '@code-dot-org/component-library/button';
import {StartOverDialog} from '@code-dot-org/lab-classic/dialogs';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {Blockly} from '@code-dot-org/blockly';
import {useRef, useCallback, useEffect, useState} from 'react';
import classNames from 'classnames';
import {
  getToolboxWidth,
  getAllGeneratedCode,
  workspaceToXmlString,
} from '@code-dot-org/blockly/utils';
import {BlocklyWorkspace} from '@code-dot-org/blockly';
import SettingsDialog from '../SettingsDialog';
import ShowCodeDialog from '../ShowCodeDialog';
import Visualization from '../Visualization';
import type {BlocklySerialization} from '@code-dot-org/blockly';
import * as api from '../../api';
import {
  getPaintTools,
  mapDraftFromLevelProperties,
  paintCell,
  serializeMapDraft,
  type MapDraft,
} from '../../editing';
import Maze from '../../Maze';
import Validator from '../../Validator';
import {
  Layout,
  Panel,
  PanelContainer,
  PanelContainerHeader,
  WorkspaceHeader,
} from '@code-dot-org/lab-classic';
import {useLevelProperties} from '@code-dot-org/lab-classic/contexts';
import blocks from '../../blocks';
import skins, {skinFor} from '../../skins';
import Instructions from '../Instructions';
import MapPainter from '../MapPainter';

import {
  ResultType,
  type MazeLevelProperties,
  type MazeEnvironment,
  type MazeDoneEventDetail,
  type MazeLabEditingProps,
} from '../../types';

import moduleStyles from './mazeLab.module.scss';

/** By default, a blank level should at least show a 'When Run' block */
const DefaultStartBlocks: BlocklySerialization = {
  blocks: {
    blocks: [
      {
        type: 'when_run',
      },
    ],
  },
};

// Default 'uncounted' block types
const UNCOUNTED_BLOCK_TYPES = ['draw_colour', 'alpha', 'comment'];

const fullUncountedBlockTypes = [...UNCOUNTED_BLOCK_TYPES];

const countBlocks = (workspace: Blockly.Workspace, uncounted: string[]) =>
  (workspace.getAllBlocks() as (Blockly.Block | null)[]).filter(block => {
    // disabled blocks are not counted
    if (!block?.isEnabled()) {
      return false;
    }

    // blocks that are of one of the uncounted block types are not
    // counted, and neither are any of their children
    while (block !== null) {
      if (uncounted.indexOf(block.type) > -1) {
        return false;
      }
      block = block.getSurroundParent();
    }

    return true;
  }).length;

interface MazeLabProps {
  /** Fires when a run finishes — surfaces the pass/fail verdict to the host. */
  onLevelResult?: (detail: MazeDoneEventDetail) => void;
  /** Author-mode section selection — see MazeLabEditingProps. Undefined
   * outside the authoring host. */
  editing?: MazeLabEditingProps;
}

const MazeLab = ({onLevelResult, editing}: MazeLabProps = {}) => {
  const levelProperties = useLevelProperties<MazeLevelProperties>();
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const mazeRef = useRef<Maze | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const toolboxHeaderRef = useRef<HTMLDivElement | null>(null);
  const blockCountRef = useRef<HTMLElement | null>(null);
  const blockCount = useRef<number>(0);
  const skin = skinFor(skins, levelProperties?.skin || 'birds');

  // Stable ref so onLevelResult identity changes never require re-wiring the
  // 'done' listener registered once in onInject.
  const onLevelResultRef = useRef(onLevelResult);
  useEffect(() => {
    onLevelResultRef.current = onLevelResult;
  }, [onLevelResult]);

  // Same stable-ref pattern, for the 'done' listener's solution-capture
  // check (Pass D) — `editing` is a fresh object every render (built inline
  // by the host), so it can't be an initEngine dependency without forcing a
  // full engine re-init on every render; dereferencing a ref at event time
  // avoids that while still seeing the current mode.
  const editingRef = useRef(editing);
  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);

  const [running, setRunning] = useState<boolean>(false);
  const [stepping, setStepping] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [showCodeOpen, setShowCodeOpen] = useState<boolean>(false);
  const [startOverOpen, setStartOverOpen] = useState<boolean>(false);
  const [showCode, setShowCode] = useState<string>('');

  useEffect(() => {
    return () => {
      mazeRef.current?.uninitialize();
      mazeRef.current = null;
    };
  }, []);

  const setToolboxHeaderWidth = useCallback(() => {
    // Get the width of the flyout / toolbox
    if (toolboxHeaderRef.current && workspaceRef.current) {
      toolboxHeaderRef.current.style.width =
        getToolboxWidth(workspaceRef.current as Blockly.WorkspaceSvg) -
        8 +
        'px';
    }
  }, [workspaceRef, toolboxHeaderRef]);

  // When the reset button is pressed
  const onReset = useCallback(() => {
    mazeRef.current?.reset?.();
  }, [mazeRef]);

  // When the 'step' button is pressed
  const onStep = useCallback(() => {
    mazeRef.current?.step?.();
  }, [mazeRef]);

  // When the 'run' button is pressed
  const onRun = useCallback(() => {
    mazeRef.current?.run?.();
  }, [mazeRef]);

  const onChange = useCallback(
    (_event: Blockly.Events.Abstract, environment: MazeEnvironment) => {
      // Update in case the toolbox changed size
      setToolboxHeaderWidth();

      if (workspaceRef.current) {
        blockCount.current = countBlocks(
          workspaceRef.current,
          fullUncountedBlockTypes,
        );
        if (environment) {
          environment.usedBlockCount = blockCount.current;
        }

        // Author-mode workspace editing (Pass C's "Student start", widened
        // in Pass D to "My solution" too): every mutation is a fresh capture
        // of the canvas as it stands, mirroring handlePaintCell's per-click
        // reporting below. Fires on every Blockly event, not just block
        // moves/creates — same granularity countBlocks above already
        // accepts; a re-report of unchanged XML on a UI-only event
        // (selection, scroll) is harmless. Which mode is active is the
        // host's business (LevelRail folds a 'studentStart' capture straight
        // into its Save draft, but only stages a 'mySolution' one as a
        // scratch attempt — see onSolutionRun for what actually becomes
        // solutionBlocksXml).
        if (editing?.workspaceMode) {
          editing.onWorkspaceChange(
            workspaceToXmlString(workspaceRef.current),
          );
        }
      }

      // Determine the used/ideal block counts
      if (environment) {
        environment.idealBlockCount = levelProperties.ideal;
      }

      // Dynamically update the counter
      if (blockCountRef.current) {
        blockCountRef.current.textContent = blockCount.current.toString();

        // Apply styling to reflect we've gone over the ideal number
        const headerNode = blockCountRef.current
          .parentNode as HTMLElement | null;
        if (blockCount.current > (levelProperties.ideal || 0)) {
          headerNode?.classList.add(moduleStyles.over);
        } else {
          headerNode?.classList.remove(moduleStyles.over);
        }
      }
    },
    [levelProperties, setToolboxHeaderWidth, editing],
  );

  // Map-painting draft (Author Mode Pass B) — local to the mounted lab so
  // the SVG re-renders on every paint, before Save. Reset from the served
  // levelProperties whenever map editing opens or closes (both directions:
  // closing without saving must discard an in-progress paint the same way
  // navigating away would), never while it stays continuously open — a
  // post-Save refetch lands the same data the author already painted, so
  // there's nothing to reconcile.
  const [mapDraft, setMapDraft] = useState<MapDraft | undefined>(undefined);
  // Starts undefined, not editing?.mapEditingActive: author mode now offers
  // map editing on mount for any maze level (no more "Level" click-target to
  // open first, see LevelRail.tsx), so mapEditingActive can already be true
  // on the very first render. Seeding the ref from that same true would make
  // the effect below see no change and skip initializing mapDraft.
  const mapEditingActiveRef = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (mapEditingActiveRef.current === editing?.mapEditingActive) {
      return;
    }
    mapEditingActiveRef.current = editing?.mapEditingActive;
    setMapDraft(
      editing?.mapEditingActive
        ? mapDraftFromLevelProperties(
            levelProperties?.map,
            levelProperties?.serializedMaze,
            skin.id,
          )
        : undefined,
    );
    // levelProperties/skin intentionally excluded: this effect's job is
    // reacting to the active/inactive EDGE, not to every served-data
    // change while active (see comment above) — including them would
    // re-derive (and discard in-progress paints) on every refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.mapEditingActive]);

  const handlePaintCell = useCallback(
    (row: number, col: number) => {
      const toolId = editing?.selectedPaintToolId;
      if (!toolId) {
        return;
      }
      const tool = getPaintTools(skin.id).find(t => t.id === toolId);
      const baseDraft =
        mapDraft ??
        mapDraftFromLevelProperties(
          levelProperties?.map,
          levelProperties?.serializedMaze,
          skin.id,
        );
      if (!tool || !baseDraft) {
        return;
      }
      const nextDraft = paintCell(baseDraft, row, col, tool);
      setMapDraft(nextDraft);
      editing?.onMapDraftChange(serializeMapDraft(nextDraft));
    },
    [editing, mapDraft, levelProperties, skin],
  );

  // Extracted from onInject so a levelProperties change that only
  // engine-construction reads (e.g. startDirection — Subtype's constructor
  // reads it once, there's no live prop path) can force a rebuild after
  // Save, via the effect below. BlocklyWorkspace only calls onInject once
  // per workspace lifetime (see its AgentEvent.Injected listener), so
  // without this a saved definition change would never reach the engine
  // until a full page reload.
  const initEngine = useCallback(
    (workspace: Blockly.WorkspaceSvg, environment: MazeEnvironment) => {
      mazeRef.current?.uninitialize();
      // A painted-but-unsaved map takes effect immediately: overlay the
      // draft onto the served levelProperties fields Maze actually reads
      // (map/serializedMaze — see MazeController.loadLevel_'s fallback
      // order, mirrored by mapDraftFromLevelProperties).
      const engineLevelProperties = mapDraft
        ? {
            ...levelProperties,
            map: mapDraft.map(row => row.map(cell => cell.tileType)),
            serializedMaze: mapDraft,
          }
        : levelProperties;
      mazeRef.current = new Maze(
        workspace,
        engineLevelProperties,
        environment,
        skin,
        {...api},
        svgRef.current!,
        Validator,
      );

      // Hook it up to the component state via events
      mazeRef.current.addEventListener('reset', onReset);
      mazeRef.current.addEventListener('stepping', () => {
        setStepping(true);
        setRunning(true);
      });
      mazeRef.current.addEventListener('running', () => setRunning(true));
      mazeRef.current.addEventListener('stopped', () => {
        setRunning(false);
        setStepping(false);
      });
      mazeRef.current.addEventListener('stepped', () => setRunning(false));
      mazeRef.current.addEventListener('done', event => {
        setRunning(false);
        const detail = (event as CustomEvent<MazeDoneEventDetail>).detail;
        onLevelResultRef.current?.(detail);

        // Author-run solution capture (Pass D): a passing run recorded
        // while editing the author's own solution IS the level's
        // solvability proof — see the plan's product decision (the author's
        // own passing run is canonical, Save is never gated on it). Report
        // it up regardless of whether the author accepts the resulting
        // "save as solution?" offer; declining is a no-op on the host side.
        if (
          editingRef.current?.workspaceMode === 'mySolution' &&
          detail.result === ResultType.SUCCESS &&
          workspaceRef.current
        ) {
          editingRef.current.onSolutionRun({
            solutionBlocksXml: workspaceToXmlString(workspaceRef.current),
            blocksUsed: detail.blocksUsed ?? blockCount.current,
          });
        }
      });

      // Get the initial width of the flyout / toolbox
      setToolboxHeaderWidth();
    },
    [
      skin,
      setToolboxHeaderWidth,
      levelProperties,
      mapDraft,
      onReset,
      setRunning,
      setStepping,
    ],
  );

  // Stable refs so the re-init effect below can call the latest initEngine
  // against the workspace/environment onInject captured, without listing
  // either as a dependency (same pattern as onLevelResultRef above).
  const initEngineRef = useRef(initEngine);
  useEffect(() => {
    initEngineRef.current = initEngine;
  }, [initEngine]);
  const environmentRef = useRef<MazeEnvironment | null>(null);

  const onInject = useCallback(
    (workspace: Blockly.WorkspaceSvg, environment: MazeEnvironment) => {
      environmentRef.current = environment;
      initEngine(workspace, environment);
    },
    [initEngine],
  );

  // Author-mode Save invalidates the levelProperties query, which refetches
  // and hands MazeLab a new levelProperties object — re-run engine
  // construction so the edit is visibly applied without a page reload. Also
  // fires on every map paint (mapDraft changes on every click, ahead of
  // Save — see the map-draft effect above): that's what makes painting
  // redraw the SVG immediately. Skips the mount itself (onInject already
  // handled that).
  const definitionMountRef = useRef(true);
  useEffect(() => {
    if (definitionMountRef.current) {
      definitionMountRef.current = false;
      return;
    }
    if (workspaceRef.current && environmentRef.current) {
      initEngineRef.current(workspaceRef.current, environmentRef.current);
    }
    // levelProperties itself is unsafely typed as always-defined (see
    // useLevelProperties) but can be undefined before the host resolves the
    // current level — optional-chain the read so this effect's dependency
    // array never throws during that window.
  }, [levelProperties?.startDirection, mapDraft]);

  const skinBlocks = blocks(skinFor(skins, levelProperties?.skin || 'birds'));

  return (
    <Layout className={moduleStyles.labMaze}>
      {settingsOpen && (
        <SettingsDialog onClose={() => setSettingsOpen(false)} />
      )}
      {showCodeOpen && (
        <ShowCodeDialog
          code={showCode.trim()}
          onClose={() => setShowCodeOpen(false)}
        />
      )}
      {startOverOpen && (
        <StartOverDialog
          onCancel={() => setStartOverOpen(false)}
          onConfirm={() => {
            setStartOverOpen(false);
          }}
        />
      )}
      <Panel id="work-area" className={classNames(moduleStyles.workArea)}>
        <PanelContainer
          className={moduleStyles.visArea}
          id="vis-panel"
          headerContent={<div>Instructions</div>}
        >
          <Panel
            className={classNames(
              moduleStyles.visUnderBox,
              editing?.authorMode && moduleStyles.visUnderBoxEditable,
              editing?.instructionsSelected &&
                moduleStyles.visUnderBoxSelected,
            )}
          >
            {editing?.authorMode && (
              <WithTooltip
                tooltipProps={{
                  text: 'Edit instructions',
                  tooltipId: 'instructions-edit-tooltip',
                  size: 'xs',
                  direction: 'onTop',
                }}
              >
                <Button
                  className={moduleStyles.instructionsEditButton}
                  size="xs"
                  type="secondary"
                  color="gray"
                  onClick={editing.onInstructionsClick}
                  ariaLabel="Select instructions"
                  isIconOnly={true}
                  icon={{
                    iconName: 'pen-to-square',
                    iconStyle: 'solid',
                  }}
                />
              </WithTooltip>
            )}
            <Instructions
              skin={skin}
              longInstructions={levelProperties.longInstructions || ''}
              authoredHints={levelProperties.authoredHints}
            />
          </Panel>
          <PanelContainerHeader>Play Area</PanelContainerHeader>
          <Panel className={moduleStyles.visBox}>
            <Visualization
              className={moduleStyles.visualization}
              ref={svgRef}
              disabled={false}
              stepping={stepping}
              running={running}
              stepButton={true}
              finishButton={false}
              onRun={onRun}
              onReset={onReset}
              onStep={onStep}
              onFinish={() => {}}
              overlay={
                editing?.mapEditingActive && mapDraft ? (
                  <MapPainter
                    rows={mapDraft.length}
                    cols={mapDraft[0]?.length ?? 0}
                    selectedToolLabel={
                      getPaintTools(skin.id).find(
                        t => t.id === editing.selectedPaintToolId,
                      )?.label
                    }
                    onPaintCell={handlePaintCell}
                  />
                ) : undefined
              }
            />
          </Panel>
        </PanelContainer>
        {levelProperties && (
          <PanelContainer
            className={moduleStyles.blocklyArea}
            id="workspace-panel"
            rightHeaderContent={
              <div className={moduleStyles.buttons}>
                <WithTooltip
                  tooltipProps={{
                    text: 'Settings',
                    tooltipId: 'settings-tooltip',
                    size: 'xs',
                    direction: 'onTop',
                  }}
                >
                  <Button
                    size="xs"
                    type="secondary"
                    color="gray"
                    onClick={() => setSettingsOpen(true)}
                    ariaLabel="Settings"
                    isIconOnly={true}
                    icon={{
                      iconName: 'gear',
                      iconStyle: 'solid',
                    }}
                  />
                </WithTooltip>
                <Button
                  className={moduleStyles.startOverButton}
                  size="xs"
                  type="secondary"
                  color="gray"
                  text="Start Over"
                  onClick={() => setStartOverOpen(true)}
                  iconLeft={{
                    iconName: 'rotate-left',
                    iconStyle: 'solid',
                  }}
                />
                <Button
                  size="xs"
                  type="secondary"
                  color="gray"
                  text="Show Code"
                  onClick={() => {
                    if (workspaceRef.current) {
                      setShowCodeOpen(true);
                      setShowCode(
                        getAllGeneratedCode({
                          language: 'simple',
                          workspaces: [workspaceRef.current],
                        }),
                      );
                    }
                  }}
                  iconLeft={{
                    iconName: 'code',
                    iconStyle: 'solid',
                  }}
                />
              </div>
            }
            leftHeaderContent={
              <>
                <div ref={toolboxHeaderRef}>
                  <PanelContainerHeader>Blocks</PanelContainerHeader>
                </div>
                <div className={moduleStyles.blockCount}>
                  <FontAwesomeV6Icon
                    iconName="puzzle-piece"
                    iconStyle="solid"
                  />
                  <span ref={blockCountRef}>0</span>
                  <span>{levelProperties.ideal}</span> Blocks
                </div>
              </>
            }
            headerContent={<WorkspaceHeader />}
            headerClassName={moduleStyles.headerWithBorder}
          >
            <Panel>
              <BlocklyWorkspace
                className={moduleStyles.blocklyWorkspace}
                options={{
                  readOnly: levelProperties.multipleChoice ? true : undefined,
                  trashcan: false,
                }}
                blocks={skinBlocks}
                startBlocks={
                  // workspaceOverride, once the host has ever set it this
                  // session (either mode entered at least once), stays the
                  // loaded program even after workspaceMode goes back to
                  // undefined ("stop editing") — switching editing off must
                  // never itself trigger a reload, or it would silently
                  // snap the canvas back to the served student blocks and
                  // orphan whatever's on screen from the draft LevelRail is
                  // about to Save. See MazeLabEditingProps.workspaceOverride.
                  editing?.workspaceOverride ??
                  (levelProperties.startBlocks || DefaultStartBlocks)
                }
                toolbox={editing?.toolboxOverride ?? levelProperties.toolboxBlocks}
                onInject={onInject}
                onChange={onChange}
                workspaceRef={workspaceRef}
              />
            </Panel>
          </PanelContainer>
        )}
      </Panel>
    </Layout>
  );
};

export default MazeLab;
