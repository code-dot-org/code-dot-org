import {useResizeObserver} from '@mantine/hooks';
import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import {
  javascriptGenerator,
  type JavascriptGenerator,
} from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import classNames from 'classnames';
import {createElement, useCallback, useEffect, useRef} from 'react';
import type {ReactElement, MutableRefObject} from 'react';

import Agent, {AgentEvent} from '../../Agent';
import Driver from '../../Driver';
import {useBlocklyContext} from '../../contexts/BlocklyContext';
import type {Plugin} from '../../plugins';
import ThrasosRenderer from '../../renderers/thrasos';
import DefaultTheme from '../../themes/default';
import type {Toolbox} from '../../toolbox';
import type {
  BlocklySerialization,
  BlockDefinitions,
  Theme,
  Renderer,
  Environment,
} from '../../types';

import moduleStyles from './blocklyWorkspace.module.scss';

export interface BlocklyWorkspaceProps<T extends Environment & object> {
  /** A set of custom blocks to load within the Blockly instance. */
  blocks?: BlockDefinitions;
  /** Some options that will alter the typical Blockly behavior. */
  options?: Blockly.BlocklyOptions;
  /** A set of blocks to load as the starting point for the workspace */
  startBlocks?: BlocklySerialization;
  /** A set of blocks to put into the toolbox or flyout within the workspace */
  toolbox?: Toolbox;
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
  onInject?: (workspace: Blockly.WorkspaceSvg, environment: T) => void;
  /** A callback for when anything in the workspace updates */
  onChange?: (event: Blockly.Events.Abstract, environment: T) => void;
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
  toolbox,
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
  // Creates the encapsulating Agent class for this workspace within the environment
  const agentRef = useRef<Agent<T> | null>(null);

  // Resize the Blockly workspace when the container changes size
  const [anchor, rect] = useResizeObserver();
  useEffect(() => {
    if (!inline) {
      if (agentRef.current?.workspace) {
        Blockly.svgResize(agentRef.current.workspace);
      }
    }
  }, [inline, rect]);

  const {
    driver: contextDriver,
    blocks: contextBlocks,
    environment: contextEnvironment,
  } = useBlocklyContext();

  // Create the Agent on mount and deconstruct it on unmount within the same
  // effect. This ensures React Strict Mode's remount cycle (mount -> unmount ->
  // mount) creates a fresh Agent each time rather than deconstructing one that
  // is still referenced by the ref.
  useEffect(() => {
    const agent = new Agent<T>(
      contextDriver?.current ||
        new Driver<T>(
          environment || contextEnvironment || ({} as unknown as T),
          renderer || ThrasosRenderer,
          theme || DefaultTheme,
          plugins || [],
        ),
      options || {},
      !!inline,
      !!hidden,
      !!embedded,
    );

    agentRef.current = agent;

    return () => {
      agentRef.current = null;
      agent.deconstruct();
    };
    // Only run on mount/unmount — these props are not expected to change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!agentRef.current) {
      return;
    }

    // Ensure that we registered the blocks prior and avoid racing the driver
    if (contextBlocks) {
      agentRef.current.driver.setBlocks(contextBlocks);
    }

    // Update toolbox
    agentRef.current.setToolbox(toolbox);
  }, [toolbox, contextBlocks]);

  const wrappedOnInject = useCallback(
    (workspace: Blockly.WorkspaceSvg) => {
      if (workspaceRef) {
        workspaceRef.current = workspace || null;
      }

      if (javascriptGeneratorRef) {
        javascriptGeneratorRef.current = javascriptGenerator;
      }

      // Ensure it resizes to the container
      if (agentRef.current && !agentRef.current.inline) {
        if (agentRef.current.workspace) {
          Blockly.svgResize(agentRef.current.workspace);
        }
      }

      if (onInject && agentRef.current) {
        onInject(workspace, agentRef.current.driver.environment);
      }
    },
    [javascriptGeneratorRef, workspaceRef, onInject],
  );

  useEffect(() => {
    const oldOnInject = wrappedOnInject;
    const currentAgent = agentRef.current;
    if (!currentAgent) {
      return;
    }

    currentAgent.addListener(AgentEvent.Injected, wrappedOnInject);

    return () => {
      if (oldOnInject) {
        currentAgent.removeListener(AgentEvent.Injected, oldOnInject);
      }
    };
  }, [wrappedOnInject]);

  useEffect(() => {
    const oldOnChange = onChange;
    const currentAgent = agentRef.current;
    if (!currentAgent) {
      return;
    }

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
    if (agentRef.current && !!inline !== agentRef.current.inline) {
      console.error(
        'Cannot switch to an inline workspace once the workspace has been created.',
      );
    }
  }, [inline]);

  useEffect(() => {
    if (
      agentRef.current &&
      renderer &&
      renderer !== agentRef.current.driver.renderer
    ) {
      console.error(
        'Cannot switch renderer once the workspace has been created.',
      );
    }
  }, [renderer]);

  useEffect(() => {
    // Update theme
    if (agentRef.current && theme) {
      agentRef.current.driver.setTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    // Either move or newly inject the Blockly workspace when the container is known
    if (agentRef.current && anchor.current) {
      // Determine the location of the workspace
      // For inline workspaces (like those within markdown instructions) create
      // the container to build it offscreen before copying it to its final
      // location.
      const container = anchor.current;
      agentRef.current.setContainer(container);
    }
  }, [workspaceRef, javascriptGeneratorRef, anchor]);

  // Register any new custom blocks
  useEffect(() => {
    Blockly.setLocale(En as unknown as {[key: string]: string});

    if (agentRef.current && blocks) {
      agentRef.current.driver.setBlocks(blocks);
    }
  }, [blocks]);

  useEffect(() => {
    if (!agentRef.current?.workspace) {
      return;
    }

    if (startBlocks) {
      agentRef.current.load(startBlocks);
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
