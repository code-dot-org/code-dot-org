// Client for the experimental cross-project scene APIs (scenes UI variant).
// See dashboard SpriteLab2Controller.

import type * as Blockly from 'blockly/core';

import {
  DashboardApiClient,
  type ExternalSceneRef,
} from '@code-dot-org/core/api';

import {type ExternalSceneOption} from './redux/spriteLab2Redux';
import {type SerializedAnimationList, type Scene} from './types';

type BlockState = Blockly.serialization.blocks.State;

export type {ExternalSceneRef};

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
  key: string,
): {channel: string; sceneId: string} | null {
  const i = key.indexOf(':');
  if (i <= 0 || i === key.length - 1) {
    return null;
  }
  return {channel: key.slice(0, i), sceneId: key.slice(i + 1)};
}

// Dropdown options for a set of external scene refs.
export function toExternalSceneOptions(
  refs: ExternalSceneRef[],
): ExternalSceneOption[] {
  return refs.map(ref => ({
    key: externalSceneKey(ref.channel, ref.sceneId),
    label: `${ref.sceneName} — ${ref.ownerName} · #${ref.channel.slice(0, 6)}`,
  }));
}

// Scenes are shared within a script; outside one there is nothing to ask.
export async function fetchSectionScenes(
  levelId: number | string,
  scriptId?: number | null,
): Promise<ExternalSceneRef[]> {
  if (!scriptId) {
    return [];
  }
  return DashboardApiClient.spriteLab.getSectionScenes({levelId, scriptId});
}

// The server serves only the owner's channel for this level and script.
export async function fetchExternalProject(
  channel: string,
  levelId: number | string,
  scriptId?: number | null,
): Promise<ExternalProject> {
  // The server returns the owner's saved sources, which are this lab's format.
  return (await DashboardApiClient.spriteLab.getExternalScenes({
    channel,
    levelId,
    scriptId,
  })) as ExternalProject;
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
    'SCENE',
  );
}

/** Every block of a serialized workspace: shadows and next chains included. */
export function forEachSavedBlock(
  source: unknown,
  visit: (block: BlockState) => void,
): void {
  const walk = (block?: BlockState) => {
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
    (source as {blocks?: {blocks?: BlockState[]}} | undefined)?.blocks
      ?.blocks || []
  ).forEach(walk);
}

/** Every non-empty value of `fieldName` on saved blocks of `blockType`. */
export function collectSavedFieldValues(
  scenes: Scene[],
  blockType: string,
  fieldName: string,
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
    }),
  );
  return [...values];
}
