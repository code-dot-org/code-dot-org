import {ScrollBlockDragger} from '@blockly/plugin-scroll-options';
import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {TopLeftMetricsManager} from '../../../metricsManager';
import {PluginType} from '../../../plugins';
import DefaultTheme from '../../../themes/default';
import scrollOptionsPlugin from '../index';
import {initializeScrollbarPair} from '../scrollbar';

Blockly.setLocale(En as unknown as {[key: string]: string});

let container: HTMLDivElement | undefined;
let workspace: Blockly.WorkspaceSvg | undefined;

afterEach(() => {
  workspace?.dispose();
  container?.remove();
  workspace = container = undefined;
});

const inject = () => {
  container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);
  return (workspace = Blockly.inject(container, {
    move: {scrollbars: true, wheel: true, drag: true},
    plugins: {
      blockDragger: ScrollBlockDragger,
      metricsManager: TopLeftMetricsManager,
    },
  }));
};

describe('plugins.md: initializeScrollbarPair', () => {
  it('PLG-6, PLG-V3: hides both scrollbars of a workspace whose content fits', () => {
    const ws = inject();
    initializeScrollbarPair(ws);
    expect(ws.scrollbar?.hScroll?.isVisible()).toBe(false);
    expect(ws.scrollbar?.vScroll?.isVisible()).toBe(false);
  });

  it('PLG-6, PLG-V3: shows a scrollbar once content overflows its axis', () => {
    const ws = inject();
    initializeScrollbarPair(ws);
    const block = Blockly.serialization.blocks.append(
      {type: 'text_print'},
      ws,
    ) as Blockly.BlockSvg;
    block.moveTo(new Blockly.utils.Coordinate(16, 2000));
    ws.resize();
    expect(ws.scrollbar?.vScroll?.isVisible()).toBe(true);
    expect(ws.scrollbar?.hScroll?.isVisible()).toBe(false);
  });

  it('PLG-6: leaves a workspace without both scrollbars alone', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    workspace = Blockly.inject(container, {});
    expect(() => initializeScrollbarPair(workspace!)).not.toThrow();
  });
});

describe('plugins.md: the scrollOptions plugin', () => {
  it('PLG-5: is an inject plugin', () => {
    expect(scrollOptionsPlugin.type).toBe(PluginType.Inject);
  });

  it('PLG-5: sets edge scrolling to follow the cursor and pairs the scrollbars once ready', async () => {
    ScrollBlockDragger.resetOptions();
    const ws = inject();
    const instance = new scrollOptionsPlugin.plugin(ws, DefaultTheme) as {
      dispose(): void;
    };
    expect(ScrollBlockDragger.options.oversizeBlockThreshold).toBe(0);
    await vi.waitFor(() =>
      expect(ws.scrollbar?.vScroll?.isVisible()).toBe(false),
    );
    expect(ws.scrollbar?.hScroll?.isVisible()).toBe(false);
    instance.dispose();
  });
});
