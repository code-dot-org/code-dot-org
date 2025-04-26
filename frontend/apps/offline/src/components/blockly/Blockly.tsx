import useResizeObserver from '@react-hook/resize-observer';
import * as BlocklyLibrary from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import React, {useEffect, useRef, useContext} from 'react';

import BlocklyContext from '@/contexts/BlocklyContext';

import {
  forciblyInsertTopBlock,
  positionBlocksOnWorkspace,
} from './serialization';

import moduleStyles from './blockly.module.scss';

export interface BlocklyProps {
  /** A set of custom blocks to load within the Blockly instance. */
  customBlocks?: BlockDefinition[];
  /** A set of blocks to load as the starting point for the workspace */
  startBlocks?: string | object;
  /** A set of blocks to put into a single, simple toolbox within the workspace */
  toolboxBlocks?: string | object;
  /** The blockly renderer to use. */
  renderer?: string;
  /** The blockly theme to use. */
  theme?: string;
  /** Whether or not to render this workspace as inline, useful for documentation */
  inline?: boolean;
  /** When specified, this ensures that the given block exists and is the top block. */
  forceInsertTopBlock?: string;
  /** A callback when the Blockly environment is loaded into the container */
  onInject?: () => void;
}

/**
 * Represents a Blockly workspace.
 */
const Blockly: React.FunctionComponent<BlocklyProps> = ({
  customBlocks,
  startBlocks,
  toolboxBlocks,
  renderer,
  theme,
  inline,
  forceInsertTopBlock,
  onInject,
}) => {
  const anchor = useRef<HTMLDivElement | HTMLSpanElement | null>();
  const workspace = useRef();

  // Pull from the provider, if it exists there and we haven't specified it
  // ourselves.
  const {
    customBlocks: storedCustomBlocks,
    renderer: storedRenderer,
    theme: storedTheme,
  } = useContext(BlocklyContext);
  customBlocks ||= storedCustomBlocks;
  renderer ||= storedRenderer;
  theme ||= storedTheme;
  console.log('BLOCKLY_INIT', customBlocks, startBlocks, renderer, theme);

  // Register renderer, if needed
  useEffect(() => {
    if (renderer) {
      if (!renderer.name) {
        throw new Error(
          "Renderer needs to have a string for a 'name' field that uniquely identifies the renderer",
        );
      } else {
        console.log('renderer', BlocklyLibrary, renderer, renderer.name);
        BlocklyLibrary.registry.register(
          BlocklyLibrary.registry.Type.RENDERER,
          renderer.name,
          renderer,
          true,
        );
      }
    }
  }, [renderer]);

  // Register any new custom blocks
  useEffect(() => {
    BlocklyLibrary.setLocale('en');
    (customBlocks || []).forEach(
      ({type, title, tooltip, functionName, generator, ...options}) => {
        if (options.message0) {
          BlocklyLibrary.common.defineBlocksWithJsonArray([{type, ...options}]);
        } else {
          BlocklyLibrary.Blocks[type] ||= {
            helpUrl: options.helpUrl || '',
            init: function () {
              this.setStyle(options.style || 'default');
              if (title) {
                const input = this.appendEndRowInput();
                input.appendField(title);
              } else if (options.titleImage) {
                const input = this.appendEndRowInput();
                input.appendField(
                  new BlocklyLibrary.FieldImage(options.titleImage),
                );
              }
              if (options.previousStatement) {
                this.setPreviousStatement(options.previousStatement);
              }
              if (options.nextStatement) {
                this.setNextStatement(options.nextStatement);
              }
              this.setTooltip(tooltip);
              if (options.init) {
                options.init.bind(this)(BlocklyLibrary);
              }
            },
          };
        }

        if (functionName) {
          javascriptGenerator.forBlock[type] = function () {
            return `${functionName}('block_id_${this.id}');\n`;
          };
        } else if (generator) {
          javascriptGenerator.forBlock[type] = generator;
        }
      },
    );
  }, [customBlocks]);

  useEffect(() => {
    // Determine the location of the workspace
    const container = inline ? document.createElement('div') : anchor.current;
    console.log(
      'FORCE RENDER',
      forceInsertTopBlock,
      toolboxBlocks,
      startBlocks,
      BlocklyLibrary,
      javascriptGenerator,
    );
    workspace.current = BlocklyLibrary.inject(container, {
      renderer: renderer?.name || 'geras',
      theme: theme || 'classic',
      toolbox: toolboxBlocks,
      media: '/blockly/media/',
      ...(inline
        ? {
            readOnly: true,
            scrollbars: false,
            media: '', // Don't need media assets
          }
        : {}),
    });

    // Massage start blocks to at least a valid empty document
    if (startBlocks === undefined || startBlocks.trim() === '') {
      startBlocks = '<xml></xml>';
    }

    // For strings, these are XML starting blocks
    if (typeof startBlocks === 'string') {
      const parser = new DOMParser();
      const xmlDoc = parser
        .parseFromString(startBlocks, 'text/xml')
        ?.querySelector(':root');

      if (forceInsertTopBlock) {
        forciblyInsertTopBlock(xmlDoc, forceInsertTopBlock);
      }

      BlocklyLibrary.Xml.clearWorkspaceAndLoadFromXml(
        xmlDoc,
        workspace.current,
      );

      // Reposition blocks if this is a full workspace
      if (!inline) {
        positionBlocksOnWorkspace(workspace.current);
      }
    }

    if (inline) {
      // Move top block to corner
      const topBlocks = workspace.current.getTopBlocks();

      for (const block of topBlocks) {
        block.moveTo(new BlocklyLibrary.utils.Coordinate(0, 0));
      }

      // Copy over SVG rendered blocks to the span in our anchor
      document.body.appendChild(container);
      BlocklyLibrary.svgResize(workspace.current);
      const svg = container.querySelector('svg')?.cloneNode(true);
      if (svg) {
        svg.style.background = 'none';
        svg.style.position = 'relative';
        svg.style.display = 'inline-block';
        svg.style.border = 'none';
        svg.querySelector('.blocklyMainBackground')?.remove();
        anchor.current.innerHTML = '';
        anchor.current.appendChild(svg);

        // Fix width and height
        const size = (svg.querySelector('.blocklyWorkspace').getClientRects() ||
          [])[0] || {
          width: 30,
          height: 30,
        };
        svg.style.width = size.width + 'px';
        svg.style.height = size.height + 'px';

        // Copy classes over
        for (const blocklyClassName of Array.from(
          container.querySelector('svg').parentNode?.classList || [],
        )) {
          console.log(blocklyClassName);
          anchor.current.classList.add(blocklyClassName);
        }
      }
    }

    if (onInject) {
      onInject();
    }

    return () => {
      workspace.current?.dispose();
    };
  }, [anchor.current, renderer]);

  // Resize the Blockly workspace when the container changes size
  if (inline) {
    useResizeObserver(anchor, () =>
      BlocklyLibrary.svgResize(workspace.current),
    );
  }

  return (
    <>
      {inline && (
        <span ref={anchor} className={moduleStyles.blocklyWorkspace} />
      )}
      {!inline && (
        <div ref={anchor} className={moduleStyles.blocklyWorkspace} />
      )}
    </>
  );
};

export default Blockly;
