import type {BlocklyData} from '@code-dot-org/lab-blockly';
import loadBlocklyData from '@code-dot-org/lab-blockly/parser';

import type {Direction} from '../FacingDirection';
import type {CraftData} from '../types';
import {convertNameToEntity} from '../utils';


/**
 * Clean up JSON and allow whitespace and JavaScript comments.
 */
export const sanitizeJSON: (data: string) => string = data =>
  data
    // Remove Windows-style newlines for convenience
    .replaceAll('\r', '')
    // Strip out line comments
    .split('\n')
    .filter(line => !line.match(/^\s*\/\//))
    .join('\n')
    // Remove whitespace
    .trim();

/**
 * Parses a level config to produce the level data we need to supply to
 * the level component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(config: {[key: string]: any}, xml?: Document, parser?: DOMParser): CraftData {
  console.log(config);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeParse = (value: string | undefined, def: any) => value !== undefined ? JSON.parse(sanitizeJSON(value)) : def;

  const gridDimensions = [
    safeParse(config.properties?.grid_width, 10),
    safeParse(config.properties?.grid_height, 10),
  ] as [number, number];

  let actionPlane = safeParse(config.properties?.action_plane, []);
  const entities: [string, number, number, Direction][] = safeParse(config.properties?.entities, []) as unknown as [string, number, number, Direction][];

  // Push entities from the action plane to the fuller entities array
  // The action plane might have 'sheepLeft' whereas we need that to be in the entities array as
  // ['sheep', <x>, <y>, <dir>]
  actionPlane = actionPlane.map((item: string | undefined, i: number) => {
    item ||= '';
    const x = i % gridDimensions[0];
    const y = Math.floor(i / gridDimensions[1]);

    const entity = convertNameToEntity(item, x, y);
    if (entity) {
      entities.push(entity);
      return '';
    }

    return item;
  });

  // Detect the 'type' of craft level and apply defaults, if necessary
  const isAgentLevel = safeParse(config.properties?.is_agent_level, false);
  const isEventLevel = safeParse(config.properties?.is_event_level, false);
  const isAquaticLevel = safeParse(config.properties?.is_aquatic_level, false);

  const craftType = isAgentLevel ? 'agent' : isEventLevel ? 'designer' : isAquaticLevel ? 'aquatic' : 'simple';

  const blocklyData: BlocklyData = loadBlocklyData(config, xml, parser);

  blocklyData.toolboxBlocks ||= {
    kind: 'flyoutToolbox',
    contents: [],
  };

  blocklyData.toolboxBlocks.contents = blocklyData.toolboxBlocks.contents.length > 0 ? blocklyData.toolboxBlocks.contents : craftType === 'simple' ? [
    {
      kind: 'block',
      type: 'craft_moveForward',
    },
    {
      kind: 'block',
      type: 'craft_turn',
      fields: {
        DIR: 'left',
      },
    },
    {
      kind: 'block',
      type: 'craft_turn',
      fields: {
        DIR: 'right',
      },
    },
  ] : [];

  return {
    ...blocklyData,
    actionPlane,
    entities,
    fluffPlane: safeParse(config.properties?.fluff_plane, []),
    groundPlane: safeParse(config.properties?.ground_plane, []),
    groundDecorationPlane: safeParse(config.properties?.ground_decoration_plane, []),
    playerStartPosition: safeParse(config.properties?.player_start_position, [0, 0]),
    playerStartDirection: safeParse(config.properties?.player_start_direction, 1),
    agentStartPosition: safeParse(config.properties?.agent_start_position, [0, 0]),
    agentStartDirection: safeParse(config.properties?.agent_start_direction, 1),
    verificationFunction: config.properties?.verification_function,
    isDaytime: safeParse(config.properties?.is_daytime, true),
    availableBlocks: config.properties?.available_blocks,
    isAgentLevel,
    isEventLevel,
    isAquaticLevel,
    levelVerificationTimeout: safeParse(config.properties?.level_verification_timeout, 0),
    usePlayer: safeParse(config.properties?.use_player, false) || craftType === 'simple',
    useAgent: safeParse(config.properties?.use_agent, false) || craftType === 'agent',
    useScore: safeParse(config.properties?.use_score, false),
    boat: safeParse(config.properties?.boat, false),
    ocean: safeParse(config.properties?.ocean, undefined),
    gridDimensions,
    showPopupOnLoad: config.properties?.show_popup_on_load,
    assetPacks: {
      beforeLoad: craftType === 'simple' ? ['playerSteve', 'adventurerAllAssetsMinusPlayer'] : craftType === 'aquatic' ? ['aquaticAllAssetsMinusPlayer', 'playerSteveAquatic'] : craftType === 'agent' ? ['playerSteve', 'playerAgent'] : craftType === 'designer' ? ['playerSteve', 'designerAllAssetsMinusPlayer'] : [],
      afterLoad: [],
    },
  };
}

export default load;
