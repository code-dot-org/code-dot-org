import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {Blockly} from '@code-dot-org/blockly-workspace';
import {useRef, useCallback, useState} from 'react';
import classNames from 'classnames';
import {getToolboxWidth} from '@code-dot-org/blockly-workspace/utils';
import {BlocklyWorkspace} from '@code-dot-org/blockly-workspace';
import Visualization from '../Visualization';
import type {BlocklySerialization} from '@code-dot-org/blockly-workspace';
import * as api from '../../api';
import Maze from '../../Maze';
import Validator from '../../Validator';
import {
  Layout,
  Panel,
  PanelContainer,
  PanelContainerHeader,
  WorkspaceHeader,
} from '@code-dot-org/lab';
import {useLevelProperties} from '@code-dot-org/lab/contexts';
import blocks from '../../blocks';
import skins, {skinFor} from '../../skins';
import Instructions from '../Instructions';

import type {MazeLevelProperties, MazeEnvironment} from '../../types';

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

const MazeLab = () => {
  const levelProperties = useLevelProperties<MazeLevelProperties>();
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const mazeRef = useRef<Maze | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const toolboxHeaderRef = useRef<HTMLDivElement | null>(null);
  const blockCountRef = useRef<HTMLElement | null>(null);
  const blockCount = useRef<number>(0);
  const skin = skinFor(skins, levelProperties?.skin || 'birds');

  const [running, setRunning] = useState<boolean>(false);
  const [stepping, setStepping] = useState<boolean>(false);

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

  const onInject = useCallback(
    (workspace: Blockly.WorkspaceSvg, environment: MazeEnvironment) => {
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
      mazeRef.current.addEventListener('done', () => setRunning(false));

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

  const skinBlocks = blocks(skinFor(skins, levelProperties?.skin || 'birds'));

  return (
    <Layout className={moduleStyles.labMaze}>
      <Panel id="work-area" className={classNames(moduleStyles.workArea)}>
        <PanelContainer
          className={moduleStyles.visArea}
          id="vis-panel"
          headerContent={<div>Play Area</div>}
        >
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
          <Panel className={moduleStyles.visUnderBox}>
            <Instructions
              skin={skin}
              longInstructions={levelProperties.longInstructions || ''}
              authoredHints={levelProperties.authoredHints}
            />
          </Panel>
        </PanelContainer>
        {levelProperties && (
          <PanelContainer
            className={moduleStyles.blocklyArea}
            id="workspace-panel"
            rightHeaderContent={
              <div className={moduleStyles.buttons}>
                <Button
                  size="xs"
                  type="secondary"
                  color="gray"
                  text="Start Over"
                  onClick={() => {}}
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
                  onClick={() => {}}
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
