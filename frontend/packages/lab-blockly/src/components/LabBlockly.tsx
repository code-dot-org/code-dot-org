import * as Blockly from 'blockly/core';
import classNames from 'classnames';
import React, {ReactNode, useMemo, useRef, useCallback} from 'react';

import {BlocklyWorkspace, BlockDefinition, BlocklyOptions} from '@code-dot-org/blockly-workspace';
import type {
  Theme,
  Renderer,
  Environment,
  BlocklySerialization,
} from '@code-dot-org/blockly-workspace';
import {BlocklyProvider} from '@code-dot-org/blockly-workspace/contexts';
import type {Plugin} from '@code-dot-org/blockly-workspace/plugins';
import {getToolboxWidth} from '@code-dot-org/blockly-workspace/utils';
import Button from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Heading6} from '@code-dot-org/component-library/typography';
import type {Level} from '@code-dot-org/models/levels';

import Workspace from '@lab-blockly/components/workspace';
import Instructions from '@lab-blockly/components/workspace/information/instructions';
import MultipleChoice from '@lab-blockly/components/workspace/information/multipleChoice';
import type {BlocklyData} from '@lab-blockly/types';

import moduleStyles from './labBlockly.module.scss';

/**
 * Specific environmental information for all blockly environments.
 */
export interface LabBlocklyEnvironment extends Environment {
  /** The current block count, if known. */
  usedBlockCount?: number;
  /** The ideal block count, if provided. */
  idealBlockCount?: number;
}

export type LabBlocklyProps<
  T extends BlocklyData = BlocklyData,
  U extends LabBlocklyEnvironment = LabBlocklyEnvironment,
> = {
  levelData: Level<T>;
  /** A set of blocks to load as the starting point for the workspace */
  startBlocks?: BlocklySerialization;
  /** A set of blocks to load into a hidden workspace */
  hiddenBlocks?: BlocklySerialization;
  /** Some options that will alter the typical Blockly behavior. */
  options?: BlocklyOptions;
  /** A set of custom blocks to load within the Blockly instance. */
  blocks?: BlockDefinition[];
  /** A component that is loaded as the level visualization */
  visualization?: ReactNode;
  /** The blockly theme to use. */
  theme?: Theme;
  /** The blockly renderer to use. */
  renderer?: Renderer;
  /** A callback when the Blockly environment is loaded into the container */
  onInject?: () => void;
  /** A callback for when anything in the workspace updates */
  onChange?: (event: Blockly.Events.Abstract) => void;
  /** The URL of an avatar image to serve as the graphical character */
  avatar?: string;
  /** A set of plugins to install to this workspace */
  plugins?: Plugin[];
  /** Blocks that are not counted toward the block count goal */
  uncountedBlockTypes?: string[];
  /** The environmental information to give to all extensions */
  environment?: U;
};

// Default 'uncounted' block types
const UNCOUNTED_BLOCK_TYPES = ['draw_colour', 'alpha', 'comment'];

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

function LabBlockly<
  T extends BlocklyData = BlocklyData,
  U extends LabBlocklyEnvironment = LabBlocklyEnvironment,
>({
  levelData,
  startBlocks,
  hiddenBlocks,
  options,
  visualization,
  blocks,
  onInject,
  onChange,
  avatar,
  theme,
  renderer,
  plugins,
  uncountedBlockTypes,
  environment,
}: LabBlocklyProps<T, U>): React.ReactElement {
  const workspaceRef = useRef<Blockly.Workspace | null>(null);
  const hiddenWorkspaceRef = useRef<Blockly.Workspace | null>(null);
  const toolboxHeaderRef = useRef<HTMLDivElement | null>(null);
  const blockCountRef = useRef<HTMLElement | null>(null);
  const blockCount = useRef<number>(0);
  const fullUncountedBlockTypes = [
    ...UNCOUNTED_BLOCK_TYPES,
    ...(uncountedBlockTypes || []),
  ];
  const toolboxBlocks = useMemo(
    () =>
      levelData.multipleChoice
        ? undefined
        : levelData.subData?.toolboxBlocks?.contents?.length === 0
          ? undefined
          : levelData.subData?.toolboxBlocks,
    [levelData],
  );
  const setToolboxHeaderWidth = useCallback(() => {
    // Get the width of the flyout / toolbox
    if (toolboxHeaderRef.current && workspaceRef.current) {
      toolboxHeaderRef.current.style.width =
        getToolboxWidth(workspaceRef.current as Blockly.WorkspaceSvg) + 'px';
    }
  }, []);

  return (
    <BlocklyProvider
      environment={environment as unknown as Environment}
      blocks={blocks}
      theme={theme}
      plugins={plugins}
      renderer={renderer}
    >
      <Workspace
        outputPane={visualization || <div/>}
        tabs={[
          {
            value: 'instructions',
            text: 'Instructions',
            tabContent: levelData.multipleChoice ? (
              <MultipleChoice multipleChoice={levelData.multipleChoice} />
            ) : (
              <Instructions
                avatar={avatar}
                instructions={levelData.longInstructions || ''}
                hints={levelData.hints}
              />
            ),
          },
          {
            value: 'teachers',
            text: 'For Teachers Only',
            tabContent: <div>Teachers</div>,
          },
        ]}
      >
        <div className={moduleStyles.labBlockly}>
          <div className={moduleStyles.header}>
            <div ref={toolboxHeaderRef} className={moduleStyles.toolboxHeader}>
              {!!toolboxBlocks && (
                <Heading6 className={moduleStyles.headerText}>
                  <FontAwesomeV6Icon
                    iconName="puzzle-piece"
                    iconStyle="solid"
                    className={moduleStyles.headerIcon}
                  />
                  <span>Blocks</span>
                </Heading6>
              )}
            </div>
            <div className={moduleStyles.workspaceHeader}>
              <Heading6 className={moduleStyles.headerText}>Workspace</Heading6>
              {!!levelData.subData?.idealBlockCount && (
                <>
                  <Heading6
                    className={classNames(
                      moduleStyles.headerText,
                      moduleStyles.blockCount,
                      blockCount.current >
                        (levelData.subData?.idealBlockCount || 0)
                        ? moduleStyles.over
                        : undefined,
                    )}
                  >
                    <span ref={blockCountRef}>{blockCount.current}</span>
                  </Heading6>
                  <Heading6
                    className={classNames(
                      moduleStyles.headerText,
                      moduleStyles.idealCount,
                    )}
                  >
                    {levelData.subData?.idealBlockCount || 0} blocks
                  </Heading6>
                </>
              )}
            </div>
            <div className={moduleStyles.actions}>
              <Button
                className={moduleStyles.startOverButton}
                size="xs"
                type="secondary"
                color="gray"
                text="Start over"
                onClick={() => {}}
                iconLeft={{
                  iconName: 'arrow-rotate-left',
                  iconStyle: 'solid',
                }}
              />
              <Button
                size="xs"
                type="secondary"
                color="gray"
                text="Show code"
                onClick={() => {}}
                iconLeft={{
                  iconName: 'code',
                  iconStyle: 'solid',
                }}
              />
            </div>
          </div>
          {hiddenBlocks && (
            <BlocklyWorkspace<U>
              hidden
              renderer={renderer}
              theme={theme}
              blocks={blocks}
              options={{
                readOnly: true,
              }}
              startBlocks={hiddenBlocks}
              plugins={plugins}
              onInject={() => {
                // Retain the hidden workspace in the environment, if it exists
                if (environment) {
                  environment.hiddenWorkspace =
                    hiddenWorkspaceRef.current || undefined;
                }
              }}
              workspaceRef={hiddenWorkspaceRef}
            />
          )}
          <BlocklyWorkspace<U>
            options={{
              readOnly: levelData.multipleChoice ? true : undefined,
              ...options,
            }}
            renderer={renderer}
            theme={theme}
            blocks={blocks}
            startBlocks={
              startBlocks ||
              levelData.template?.subData?.startBlocks ||
              levelData.subData?.startBlocks
            }
            toolboxBlocks={toolboxBlocks}
            onChange={(event: Blockly.Events.Abstract) => {
              if (workspaceRef.current) {
                blockCount.current = countBlocks(
                  workspaceRef.current,
                  fullUncountedBlockTypes,
                );
                if (environment) {
                  environment.usedBlockCount = blockCount.current;
                }
              }
              if (environment) {
                environment.idealBlockCount =
                  levelData.subData?.idealBlockCount;
              }

              // Dynamically update the counter
              if (blockCountRef.current) {
                blockCountRef.current.textContent =
                  blockCount.current.toString();

                // Apply styling to reflect we've gone over the ideal number
                const headerNode = blockCountRef.current
                  .parentNode as HTMLElement | null;
                if (
                  blockCount.current > (levelData.subData?.idealBlockCount || 0)
                ) {
                  headerNode?.classList.add(moduleStyles.over);
                } else {
                  headerNode?.classList.remove(moduleStyles.over);
                }
              }

              // Update toolbox / flyout width
              setToolboxHeaderWidth();

              if (onChange) {
                onChange(event);
              }
            }}
            onInject={() => {
              // Retain the main workspace in the environment, if it exists
              if (environment) {
                environment.mainWorkspace = workspaceRef.current || undefined;
              }

              // Get the initial width of the flyout / toolbox
              setToolboxHeaderWidth();

              if (onInject) {
                onInject();
              }
            }}
            workspaceRef={workspaceRef}
            plugins={plugins}
          />
        </div>
      </Workspace>
    </BlocklyProvider>
  );
}

export default LabBlockly;
