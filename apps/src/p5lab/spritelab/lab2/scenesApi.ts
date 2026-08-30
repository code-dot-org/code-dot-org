// Client for the experimental cross-project scene APIs (scenes UI variant).
// See dashboard SpriteLab2Controller.

import HttpClient from '@cdo/apps/util/HttpClient';

import {ExternalSceneOption} from './redux/spriteLab2Redux';
import {SerializedAnimationList, Scene} from './types';

// One scene in a section-mate's project, as listed by the dropdown.
export interface ExternalSceneRef {
  channel: string;
  sceneId: string;
  sceneName: string;
  ownerName: string;
}

// A fetched external project: everything needed to run its scenes.
export interface ExternalProject {
  scenes: Scene[];
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

// Dropdown options for a set of external scene refs.
export function toExternalSceneOptions(
  refs: ExternalSceneRef[]
): ExternalSceneOption[] {
  return refs.map(ref => ({
    key: externalSceneKey(ref.channel, ref.sceneId),
    label: `${ref.sceneName} — ${ref.ownerName} · #${ref.channel.slice(0, 6)}`,
  }));
}

// Scenes are shared within a script; outside one there is nothing to ask.
export async function fetchSectionScenes(
  levelId: number | string,
  scriptId?: number | null
): Promise<ExternalSceneRef[]> {
  if (!scriptId) {
    return [];
  }
  const {value} = await HttpClient.fetchJson<{scenes?: ExternalSceneRef[]}>(
    `/sprite_lab2/section_scenes?level_id=${levelId}&script_id=${scriptId}`
  );
  return value.scenes || [];
}

// The server serves only the owner's channel for this level and script.
export async function fetchExternalProject(
  channel: string,
  levelId: number | string,
  scriptId?: number | null
): Promise<ExternalProject> {
  const {value} = await HttpClient.fetchJson<ExternalProject>(
    `/sprite_lab2/external_scenes?channel=${encodeURIComponent(
      channel
    )}&level_id=${levelId}&script_id=${scriptId ?? ''}`
  );
  return value;
}

/**
 * Collect every external-scene key referenced by saved blocks, so saved
 * dropdown values survive block-load validation (as placeholder options) even
 * when the listing API fails or an entry has vanished from it.
 */
export function collectSavedExternalKeys(scenes: Scene[]): string[] {
  return collectSavedFieldValues(
    scenes,
    'spritelab2_goToExternalScene',
    'SCENE'
  );
}

/** Every non-empty value of `fieldName` on saved blocks of `blockType`. */
export function collectSavedFieldValues(
  scenes: Scene[],
  blockType: string,
  fieldName: string
): string[] {
  const values = new Set<string>();
  const walkBlock = (block: {
    type?: string;
    fields?: {[name: string]: unknown};
    inputs?: {[name: string]: {block?: object; shadow?: object}};
    next?: {block?: object};
  }) => {
    if (!block) {
      return;
    }
    if (block.type === blockType) {
      const value = block.fields?.[fieldName];
      if (typeof value === 'string' && value) {
        values.add(value);
      }
    }
    Object.values(block.inputs || {}).forEach(input => {
      walkBlock((input.block || input.shadow) as typeof block);
    });
    walkBlock(block.next?.block as typeof block);
  };
  scenes.forEach(scene =>
    (
      (scene.source as {blocks?: {blocks?: object[]}} | undefined)?.blocks
        ?.blocks || []
    ).forEach(block => walkBlock(block as Parameters<typeof walkBlock>[0]))
  );
  return [...values];
}
