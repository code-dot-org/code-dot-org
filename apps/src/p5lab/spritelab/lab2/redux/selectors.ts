// Root-state selectors for the AI codegen flow. The animationList slice is
// the classic one and untyped, so state is loosely typed here.

import {BACKGROUNDS_CATEGORY, BLOCKS_CATEGORY} from '../types';

export interface AvailableImageNames {
  costumes: string[];
  backgrounds: string[];
  blocks: string[];
}

interface StateWithLabSlices {
  animationList?: {
    orderedKeys: string[];
    propsByKey: {[key: string]: {name?: string; categories?: string[]}};
  };
  spriteLab2?: {scenes: {name?: string}[]};
}

// The project's costume, background, and block-tile names, so the model only
// references images that actually exist. The generate flow validates the
// model's output against the same lists.
export function selectAvailableImageNames(
  state: StateWithLabSlices
): AvailableImageNames {
  const costumes: string[] = [];
  const backgrounds: string[] = [];
  const blocks: string[] = [];
  const animationList = state.animationList;
  (animationList?.orderedKeys || []).forEach((key: string) => {
    const props = animationList?.propsByKey[key];
    if (!props?.name) {
      return;
    }
    const categories = props.categories || [];
    if (categories.includes(BACKGROUNDS_CATEGORY)) {
      backgrounds.push(props.name);
    } else if (categories.includes(BLOCKS_CATEGORY)) {
      blocks.push(props.name);
    } else {
      costumes.push(props.name);
    }
  });
  return {costumes, backgrounds, blocks};
}

// The project's scene names (for go_to_scene).
export function selectSceneNames(state: StateWithLabSlices): string[] {
  const scenes = state.spriteLab2?.scenes || [];
  return scenes.map(scene => scene.name).filter(Boolean) as string[];
}
