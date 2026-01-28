'use client';

import {useResizeObserver} from '@mantine/hooks';
import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import {javascriptGenerator, JavascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import classNames from 'classnames';
import {createElement, useEffect, useRef} from 'react';
import type {ReactElement, MutableRefObject} from 'react';

console.log('blockly-workspace Blockly:', Blockly);

import Agent, {AgentEvent} from '../../Agent';
import Driver from '../../Driver';
import {useBlocklyContext} from '../../contexts/BlocklyContext';
import type {Plugin} from '../../plugins';
import ThrasosRenderer from '../../renderers/thrasos';
import DefaultTheme from '../../themes/default';
import type {
  BlocklySerialization,
  BlockDefinition,
  Theme,
  Renderer,
  Environment,
} from '../../types';

import moduleStyles from './blocklyWorkspace.module.scss';

export interface BlocklyWorkspaceProps<T extends Environment & object> {
  /** A set of custom blocks to load within the Blockly instance. */
  blocks?: BlockDefinition[];
  /** Some options that will alter the typical Blockly behavior. */
  options?: Blockly.BlocklyOptions;
  /** A set of blocks to load as the starting point for the workspace */
  startBlocks?: BlocklySerialization;
  /** A set of blocks to put into the toolbox or flyout within the workspace */
  toolboxBlocks?: Blockly.utils.toolbox.ToolboxInfo;
  /** The blockly renderer to use. */
  renderer?: Renderer;
  /** The blockly theme to use. */
  theme?: Theme;
  /** Whether or not to render this workspace as inline, useful for documentation */
  inline?: boolean;
  /**
   * Whether or not the workspace is considered embedded.
   *
   * An embedded workspace is one that is not meant to be modified, but rather
   * shown as an example or preview.
   */
  embedded?: boolean;
  /** Whether or not this is a hidden workspace. */
  hidden?: boolean;
  /** A callback when the Blockly environment is loaded into the container */
  onInject?: (workspace: Blockly.WorkspaceSvg) => void;
  /** A callback for when anything in the workspace updates */
  onChange?: (event: Blockly.Events.Abstract) => void;
  /** A set of plugins to install to this workspace */
  plugins?: Plugin[];
  /** The info to pass along to extensions */
  environment?: T;
  /**
   * A MutableRef that can hold a reference to the workspace itself.
   *
   * This will be certainly set when onInject is called.
   */
  workspaceRef?: MutableRefObject<Blockly.WorkspaceSvg | null>;
  /**
   * A MutableRef that holds the code generator.
   */
  javascriptGeneratorRef?: MutableRefObject<JavascriptGenerator | null>;
  /**
   * Any additional class to apply to the workspace container.
   */
  className?: string;
}

/**
 * Represents a Blockly workspace.
 */
function BlocklyWorkspace<T extends Environment & object = Environment>({
  blocks,
  options,
  startBlocks,
  toolboxBlocks,
  renderer,
  theme,
  inline,
  embedded,
  hidden,
  onInject,
  onChange,
  plugins,
  environment,
  workspaceRef,
  javascriptGeneratorRef,
  className,
}: BlocklyWorkspaceProps<T>): ReactElement {
  // Resize the Blockly workspace when the container changes size
  const [anchor, rect] = useResizeObserver();
  useEffect(() => {
    if (!inline) {
      if (agent.current.workspace) {
        Blockly.svgResize(agent.current.workspace);
      }
    }
  }, [inline, rect]);

  const {driver: contextDriver} = useBlocklyContext();

  theme ||= DefaultTheme;

  // Create a Driver to handle all of the state if none are present in the environment already
  const driver = useRef<Driver<T>>(
    contextDriver?.current ||
      new Driver<T>(
        environment || ({} as unknown as T),
        renderer || ThrasosRenderer,
        theme || DefaultTheme,
        plugins || [],
      ),
  );

  // Creates the encapsulating Agent class for this workspace within the environment
  const agent = useRef<Agent<T>>(
    new Agent(driver.current, options || {}, !!inline, !!hidden, !!embedded),
  );

  useEffect(() => {
    // Update toolbox
    agent.current.toolbox = toolboxBlocks;
  }, [toolboxBlocks]);

  useEffect(() => {
    const oldOnInject = onInject;
    const currentAgent = agent.current;

    if (onInject) {
      currentAgent.addListener(AgentEvent.Injected, onInject);
    }

    return () => {
      if (oldOnInject) {
        currentAgent.removeListener(AgentEvent.Injected, oldOnInject);
      }
    };
  }, [onInject]);

  useEffect(() => {
    const oldOnChange = onChange;
    const currentAgent = agent.current;

    if (onChange) {
      currentAgent.addListener(AgentEvent.BlocklyEvent, onChange);
    }

    return () => {
      if (oldOnChange) {
        currentAgent.removeListener(AgentEvent.BlocklyEvent, oldOnChange);
      }
    };
  }, [onChange]);

  useEffect(() => {
    if (!!inline !== agent.current.inline) {
      console.error(
        'Cannot switch to an inline workspace once the workspace has been created.',
      );
    }
  }, [inline]);

  useEffect(() => {
    if (renderer !== agent.current.driver.renderer) {
      console.error(
        'Cannot switch renderer once the workspace has been created.',
      );
    }
  }, [renderer]);

  useEffect(() => {
    // Update theme
    agent.current.driver.theme = theme;
  }, [theme]);

  useEffect(() => {
    // Either move or newly inject the Blockly workspace when the container is known
    if (anchor.current) {
      // Determine the location of the workspace
      // For inline workspaces (like those within markdown instructions) create
      // the container to build it offscreen before copying it to its final
      // location.
      const container = anchor.current;
      agent.current.container = container;

      if (workspaceRef) {
        workspaceRef.current = agent.current.workspace || null;
      }

      if (javascriptGeneratorRef) {
        javascriptGeneratorRef.current = javascriptGenerator;
      }

      // Ensure it resizes to the container
      if (!agent.current.inline) {
        if (agent.current.workspace) {
          Blockly.svgResize(agent.current.workspace);
        }
      }
    }
  }, [workspaceRef, javascriptGeneratorRef, anchor]);

  // Register any new custom blocks
  useEffect(() => {
    Blockly.setLocale(En as unknown as {[key: string]: string});

    driver.current.blocks = blocks || [];
  }, [blocks, environment]);

  useEffect(() => {
    if (!agent.current.workspace) {
      return;
    }

    if (startBlocks) {
      agent.current.load(startBlocks);
    }
  }, [inline, startBlocks]);

  return createElement(inline ? 'span' : 'div', {
    ref: anchor,
    className: classNames([
      moduleStyles.blocklyWorkspace,
      className,
      ...(hidden ? [moduleStyles.hiddenWorkspace] : []),
    ]),
  });
}

export default BlocklyWorkspace;
