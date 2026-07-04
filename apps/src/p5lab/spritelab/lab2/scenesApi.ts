// Client for the experimental cross-project scene APIs (scenes UI variant).
// See dashboard SpriteLab2Controller.

import {SerializedAnimationList, SpriteLab2Scene} from './types';

// One scene in a section-mate's project, as listed by the dropdown.
export interface ExternalSceneRef {
  channel: string;
  sceneId: string;
  sceneName: string;
  ownerName: string;
}

// A fetched external project: everything needed to run its scenes.
export interface ExternalProject {
  scenes: SpriteLab2Scene[];
  animations: SerializedAnimationList;
  ownerName: string;
}

// The composite key stored in the go-to-external-scene block's dropdown (the
// source of truth for a cross-project scene reference). Scene ids are uuids,
// so ':' is unambiguous.
export function externalSceneKey(channel: string, sceneId: string): string {
  return `${channel}:${sceneId}`;
}

export function parseExternalSceneKey(
  key: string
): {channel: string; sceneId: string} | null {
  const i = key.indexOf(':');
  if (i <= 0 || i === key.length - 1) {
    return null;
  }
  return {channel: key.slice(0, i), sceneId: key.slice(i + 1)};
}

export async function fetchSectionScenes(
  levelId: number | string
): Promise<ExternalSceneRef[]> {
  const response = await fetch(
    `/sprite_lab2/section_scenes?level_id=${levelId}`
  );
  if (!response.ok) {
    throw new Error(`section_scenes failed: ${response.status}`);
  }
  return (await response.json()).scenes || [];
}

export async function fetchExternalProject(
  channel: string
): Promise<ExternalProject> {
  const response = await fetch(
    `/sprite_lab2/external_scenes?channel=${encodeURIComponent(channel)}`
  );
  if (!response.ok) {
    throw new Error(`external_scenes failed: ${response.status}`);
  }
  return await response.json();
}

/**
 * Collect every external-scene key referenced by saved blocks, so saved
 * dropdown values survive block-load validation (as placeholder options) even
 * when the listing API fails or an entry has vanished from it.
 */
export function collectSavedExternalKeys(scenes: SpriteLab2Scene[]): string[] {
  const keys = new Set<string>();
  const walkBlock = (block: {
    type?: string;
    fields?: {[name: string]: unknown};
    inputs?: {[name: string]: {block?: object; shadow?: object}};
    next?: {block?: object};
  }) => {
    if (!block) {
      return;
    }
    if (block.type === 'spritelab2_goToExternalScene') {
      const value = block.fields?.SCENE;
      if (typeof value === 'string' && value) {
        keys.add(value);
      }
    }
    Object.values(block.inputs || {}).forEach(input => {
      walkBlock((input.block || input.shadow) as typeof block);
    });
    walkBlock(block.next?.block as typeof block);
  };
  scenes.forEach(scene =>
    (scene.source?.blocks?.blocks || []).forEach(walkBlock)
  );
  return [...keys];
}
