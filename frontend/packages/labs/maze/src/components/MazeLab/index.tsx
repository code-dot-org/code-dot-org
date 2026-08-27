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
} from '@code-dot-org/blockly/utils';
import {BlocklyWorkspace} from '@code-dot-org/blockly';
import SettingsDialog from '../SettingsDialog';
import ShowCodeDialog from '../ShowCodeDialog';
import Visualization from '../Visualization';
import type {BlocklySerialization} from '@code-dot-org/blockly';
import * as api from '../../api';
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

import type {
  MazeLevelProperties,
  MazeEnvironment,
  MazeDoneEventDetail,
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
}

const MazeLab = ({onLevelResult}: MazeLabProps = {}) => {
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
    [levelProperties, setToolboxHeaderWidth],
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
      mazeRef.current = new Maze(
        workspace,
        levelProperties,
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
        onLevelResultRef.current?.(
          (event as CustomEvent<MazeDoneEventDetail>).detail,
        );
      });

      // Get the initial width of the flyout / toolbox
      setToolboxHeaderWidth();
    },
    [
      skin,
      setToolboxHeaderWidth,
      levelProperties,
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
  // construction so the edit is visibly applied without a page reload. Skips
  // the mount itself (onInject already handled that).
  const startDirectionMountRef = useRef(true);
  useEffect(() => {
    if (startDirectionMountRef.current) {
      startDirectionMountRef.current = false;
      return;
    }
    if (workspaceRef.current && environmentRef.current) {
      initEngineRef.current(workspaceRef.current, environmentRef.current);
    }
    // levelProperties itself is unsafely typed as always-defined (see
    // useLevelProperties) but can be undefined before the host resolves the
    // current level — optional-chain the read so this effect's dependency
    // array never throws during that window.
  }, [levelProperties?.startDirection]);

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
          <Panel className={moduleStyles.visUnderBox}>
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
                startBlocks={levelProperties.startBlocks || DefaultStartBlocks}
                toolbox={levelProperties.toolboxBlocks}
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
