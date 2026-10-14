// The arrows in All scenes: every go-to-scene block in a scene's code
// links it to the scene the block names.

import {JsonBlockConfig} from '@cdo/apps/blockly/types';

import {GO_TO_SCENE_BLOCK_TYPE} from './blockly/blockDefinitions/goToScene';
import {Scene} from './types';

export interface SceneLink {
  from: string;
  to: string;
}

function* walk(block: JsonBlockConfig): Generator<JsonBlockConfig> {
  yield block;
  for (const input of Object.values(block.inputs || {})) {
    if (input.block) {
      yield* walk(input.block);
    }
  }
  if (block.next?.block) {
    yield* walk(block.next.block);
  }
}

/**
 * Each scene's links to other scenes, once each, in scene order: a
 * go-to-scene block naming a scene that exists and is not its own.
 */
export function sceneLinks(scenes: Scene[]): SceneLink[] {
  const ids = new Set(scenes.map(scene => scene.id));
  const links: SceneLink[] = [];
  const seen = new Set<string>();
  for (const scene of scenes) {
    const roots = scene.source?.blocks?.blocks || [];
    for (const root of roots) {
      for (const block of walk(root)) {
        if (block.type !== GO_TO_SCENE_BLOCK_TYPE) {
          continue;
        }
        const to = block.fields?.SCENE;
        const key = `${scene.id}->${to}`;
        if (
          typeof to === 'string' &&
          to !== scene.id &&
          ids.has(to) &&
          !seen.has(key)
        ) {
          seen.add(key);
          links.push({from: scene.id, to});
        }
      }
    }
  }
  return links;
}
