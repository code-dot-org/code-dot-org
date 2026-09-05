// Client for the experimental cross-project scene APIs (scenes UI variant).
// See dashboard SpriteLab2Controller.

import {cloneDeep} from 'lodash';

import {JsonBlockConfig, WorkspaceSerialization} from '@cdo/apps/blockly/types';
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

/** Every block of a serialized workspace: shadows and next chains included. */
export function forEachSavedBlock(
  source: unknown,
  visit: (block: JsonBlockConfig) => void
): void {
  const walk = (block?: JsonBlockConfig) => {
    if (!block) {
      return;
    }
    visit(block);
    Object.values(block.inputs || {}).forEach(input => {
      walk(input.block);
      walk(input.shadow);
    });
    if (block.next) {
      walk(block.next.block);
      walk(block.next.shadow);
    }
  };
  (
    (source as {blocks?: {blocks?: JsonBlockConfig[]}} | undefined)?.blocks
      ?.blocks || []
  ).forEach(walk);
}

/**
 * Unlock blocks a past toolbox save baked in with the student default's
 * editing locks, so the toolbox editor can finally remove them. Delete
 * locks are never authorable in toolbox mode, so they go everywhere;
 * move locks go only on root blocks — an immovable CHILD is an authored
 * toolbox feature (the workspace context menu offers it there), while a
 * root's can only be old bake residue, is not authorable or clearable in
 * toolbox mode, and would ride the flyout into student workspaces.
 */
export function stripEditingLocks(
  source: WorkspaceSerialization
): WorkspaceSerialization {
  const stripped = cloneDeep(source);
  forEachSavedBlock(stripped, block => {
    delete block.deletable;
  });
  (
    (stripped as {blocks?: {blocks?: JsonBlockConfig[]}}).blocks?.blocks || []
  ).forEach(block => {
    delete block.movable;
  });
  return stripped;
}

/** Every non-empty value of `fieldName` on saved blocks of `blockType`. */
export function collectSavedFieldValues(
  scenes: Scene[],
  blockType: string,
  fieldName: string
): string[] {
  const values = new Set<string>();
  scenes.forEach(scene =>
    forEachSavedBlock(scene.source, block => {
      if (block.type !== blockType) {
        return;
      }
      const value = block.fields?.[fieldName];
      if (typeof value === 'string' && value) {
        values.add(value);
      }
    })
  );
  return [...values];
}
