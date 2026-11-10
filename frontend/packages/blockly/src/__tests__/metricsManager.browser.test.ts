import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, describe, expect, it} from 'vitest';

import {TopLeftMetricsManager} from '../metricsManager';

Blockly.setLocale(En as unknown as {[key: string]: string});

type Region = Blockly.MetricsManager.ContainerRegion;
type Padded = {top: number; bottom: number; left: number; right: number};

let container: HTMLDivElement | undefined;
let workspace: Blockly.WorkspaceSvg | undefined;

afterEach(() => {
  workspace?.dispose();
  container?.remove();
  workspace = container = undefined;
});

const inject = (rtl: boolean) => {
  container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);
  workspace = Blockly.inject(container, {
    rtl,
    plugins: {metricsManager: TopLeftMetricsManager},
  });
  return workspace.getMetricsManager() as unknown as TopLeftMetricsManager & {
    getPaddedContent_(view: Region, content: Region): Padded;
  };
};

const region = (left: number, top: number, width: number, height: number) => ({
  left,
  top,
  width,
  height,
});

describe('plugins.md: TopLeftMetricsManager', () => {
  it('PLG-1: is the metrics manager of a workspace that names it', () => {
    expect(inject(false)).toBeInstanceOf(TopLeftMetricsManager);
  });

  it('PLG-2, PLG-V1: anchors content that fits at the top left, with nothing to scroll', () => {
    const manager = inject(false);
    expect(
      manager.getPaddedContent_(
        region(0, 0, 800, 600),
        region(16, 16, 200, 50),
      ),
    ).toEqual({top: 0, left: 0, bottom: 600, right: 800});
  });

  it('PLG-2, PLG-V2: extends past content that does not fit, by 20 across and 100 down', () => {
    const manager = inject(false);
    expect(
      manager.getPaddedContent_(
        region(0, 0, 800, 600),
        region(16, 16, 1000, 700),
      ),
    ).toEqual({top: 0, left: 0, bottom: 816, right: 1036});
  });

  it('PLG-3: right to left, extends to the left of the content by 20', () => {
    const manager = inject(true);
    expect(
      manager.getPaddedContent_(
        region(0, 0, 800, 600),
        region(-300, 16, 1000, 50),
      ),
    ).toEqual({top: 0, left: -320, bottom: 600, right: 800});
  });

  it('PLG-4: has fixed edges left to right, and none right to left', () => {
    expect(inject(false).hasFixedEdges()).toBe(true);
    workspace?.dispose();
    container?.remove();
    expect(inject(true).hasFixedEdges()).toBe(false);
  });
});
