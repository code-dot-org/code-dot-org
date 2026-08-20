import type {BuildlabWorkspaceState} from './BlocklyWorkspace';
import {SPRITE_LAB_STARTER_ASSETS} from './starterAssets';

export type ElementKind =
  | 'button'
  | 'dropdown'
  | 'label'
  | 'sprite'
  | 'textArea'
  | 'textInput';
export type AssetType = 'costume' | 'animation' | 'background';
export type ObjectFit = 'fill' | 'cover' | 'contain' | 'none';
export type TextAlignment = 'left' | 'right' | 'center' | 'justify';

export interface StageElement {
  assetId?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  fontFamily?: string;
  fontSize?: number;
  height?: number;
  iconColor?: string;
  id: string;
  imageAssetId?: string;
  kind: ElementKind;
  label: string;
  inputValue?: string;
  mlFeatureId?: string;
  mlModelId?: string;
  objectFit?: ObjectFit;
  options?: string[];
  screenId: string;
  textAlign?: TextAlignment;
  textColor?: string;
  visible?: boolean;
  width?: number;
  x: number;
  y: number;
}

export interface MlModelFeature {
  description?: string;
  id: string;
  max?: number;
  min?: number;
  values?: string[];
}

export interface MlModelMetadata {
  datasetDetails?: {description?: string; numRows?: number};
  features: MlModelFeature[];
  label: MlModelFeature;
  labelColumn?: string;
  name?: string;
  potentialMisuses?: string;
  potentialUses?: string;
  summaryStat?: {stat?: number};
}

export interface ImportedMlModel {
  id: string;
  metadata: MlModelMetadata;
  name: string;
}

export interface StageScreen {
  backgroundAssetId?: string;
  backgroundColor?: string;
  id: string;
  isDefault?: boolean;
  name: string;
}

export interface Asset {
  assetType: AssetType;
  dataUrl?: string;
  frames?: string[];
  id: string;
  name: string;
  sourceUrl?: string;
  style: 'sun' | 'orbit' | 'wave';
}

export interface ProjectDataColumn {
  id: string;
  name: string;
}

export interface ProjectDataRow {
  id: string;
  values: Record<string, string>;
}

export interface ProjectDataTable {
  columns: ProjectDataColumn[];
  id: string;
  name: string;
  rows: ProjectDataRow[];
}

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

export interface BuildLabProject {
  assets: Asset[];
  dataTables: ProjectDataTable[];
  elements: StageElement[];
  mlModels?: ImportedMlModel[];
  keyValuePairs: KeyValuePair[];
  screens: StageScreen[];
  starterAssetsVersion?: number;
  workspaceState: BuildlabWorkspaceState;
}

export const SPRITE_LAB_STARTER_ASSETS_VERSION = 1;

export const DEFAULT_PROJECT: BuildLabProject = {
  assets: SPRITE_LAB_STARTER_ASSETS,
  dataTables: [
    {
      columns: [
        {id: 'name', name: 'name'},
        {id: 'score', name: 'score'},
      ],
      id: 'scores',
      name: 'Scores',
      rows: [
        {id: 'scores-row-1', values: {name: 'Avery', score: '12'}},
        {id: 'scores-row-2', values: {name: 'Sam', score: '8'}},
      ],
    },
  ],
  elements: [
    {
      id: 'label1',
      kind: 'label',
      label: 'Welcome to Build Lab',
      screenId: 'screen1',
      x: 54,
      y: 64,
    },
    {
      id: 'button1',
      kind: 'button',
      label: 'Start',
      screenId: 'screen1',
      x: 145,
      y: 155,
    },
    {
      assetId: 'bear',
      id: 'sprite1',
      kind: 'sprite',
      label: 'Orbit',
      screenId: 'screen1',
      x: 162,
      y: 245,
    },
  ],
  mlModels: [],
  keyValuePairs: [
    {id: 'welcome-message', key: 'welcomeMessage', value: 'Hello, friend!'},
  ],
  screens: [
    {
      backgroundAssetId: 'background-space',
      id: 'screen1',
      isDefault: true,
      name: 'Screen 1',
    },
  ],
  starterAssetsVersion: SPRITE_LAB_STARTER_ASSETS_VERSION,
  workspaceState: {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'buildlab_when_run',
          id: 'project-start',
          x: 48,
          y: 48,
          next: {
            block: {
              type: 'buildlab_create_sprite',
              id: 'starter-sprite',
              fields: {ASSET: 'bear', X: 200, Y: 200},
            },
          },
        },
      ],
    },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWorkspaceState(value: unknown): value is BuildlabWorkspaceState {
  if (!isRecord(value) || !isRecord(value.blocks)) {
    return false;
  }

  return (
    typeof value.blocks.languageVersion === 'number' &&
    Array.isArray(value.blocks.blocks)
  );
}

function isImportedMlModel(value: unknown): value is ImportedMlModel {
  if (!isRecord(value) || !isRecord(value.metadata)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.metadata.features) &&
    isRecord(value.metadata.label) &&
    typeof value.metadata.label.id === 'string'
  );
}

function isProject(value: unknown): value is BuildLabProject {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.assets) &&
    Array.isArray(value.dataTables) &&
    Array.isArray(value.elements) &&
    Array.isArray(value.keyValuePairs) &&
    Array.isArray(value.screens) &&
    (!('mlModels' in value) ||
      (Array.isArray(value.mlModels) &&
        value.mlModels.every(isImportedMlModel))) &&
    isWorkspaceState(value.workspaceState)
  );
}

/**
 * Parse the JSON stored in a project's source file. Invalid or older data is
 * rejected as a whole so the editor can start from a known-good project.
 */
export function parseBuildLabProject(source: string): BuildLabProject | null {
  if (!source.trim()) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(source);
    return isProject(value) ? value : null;
  } catch {
    return null;
  }
}

export function serializeBuildLabProject(project: BuildLabProject): string {
  return JSON.stringify(project);
}

/**
 * Add the shared Sprite Lab catalog to projects saved before the catalog was
 * introduced. The version marker makes this a one-time migration, so deleting
 * a starter asset remains a persistent project change.
 */
export function migrateBuildLabProject(
  project: BuildLabProject,
): BuildLabProject {
  if (
    (project.starterAssetsVersion ?? 0) >= SPRITE_LAB_STARTER_ASSETS_VERSION
  ) {
    return project;
  }

  const existingAssetIds = new Set(project.assets.map(asset => asset.id));
  return {
    ...project,
    assets: [
      ...project.assets,
      ...SPRITE_LAB_STARTER_ASSETS.filter(
        asset => !existingAssetIds.has(asset.id),
      ),
    ],
    starterAssetsVersion: SPRITE_LAB_STARTER_ASSETS_VERSION,
  };
}

export function cloneBuildLabProject(
  project: BuildLabProject,
): BuildLabProject {
  return JSON.parse(serializeBuildLabProject(project)) as BuildLabProject;
}
