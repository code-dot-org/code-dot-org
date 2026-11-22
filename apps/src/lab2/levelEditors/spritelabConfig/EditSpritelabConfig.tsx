// The level settings editor for Sprite Lab in Lab2: the shared level config
// editor with the lab's schema, its conversion of older properties, and a
// preview of the level running in the lab.

import React from 'react';

import {
  FlatProperties,
  levelConfigFromFlat,
} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/fromFlat';
import {
  editableParts,
  LevelConfig,
  levelConfigSchema,
} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/schema';

import LevelConfigEditor from '../levelConfig/LevelConfigEditor';
import LevelPreviewFrame from '../levelConfig/LevelPreviewFrame';

// The level mode form, which this editor replaces once a level is
// converted.
const REPLACED_SECTIONS = ['level_mode_area'];

interface EditSpritelabConfigProps {
  levelId: number;
  initialConfig: unknown;
  /** The level's older settings, by their names in the lab. */
  flatProperties: FlatProperties;
  /** The level's toolbox, for the block types its settings can name. */
  toolboxDefinition?: unknown;
}

// Every block type in a toolbox definition, either a flyout or a category
// toolbox.
function toolboxBlockTypes(definition: unknown): string[] {
  const types = new Set<string>();
  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
    } else if (node && typeof node === 'object') {
      const {kind, type, contents} = node as Record<string, unknown>;
      if (kind === 'block' && typeof type === 'string') {
        types.add(type);
      }
      visit(contents);
    }
  };
  visit(definition);
  return [...types];
}

const EditSpritelabConfig: React.FunctionComponent<
  EditSpritelabConfigProps
> = ({levelId, initialConfig, flatProperties, toolboxDefinition}) => (
  <LevelConfigEditor
    suppliedOptions={{
      toolboxBlockTypes: toolboxBlockTypes(toolboxDefinition).map(type => ({
        value: type,
        label: type,
      })),
    }}
    schema={levelConfigSchema}
    initialValue={initialConfig ?? undefined}
    inputName="level[level_config]"
    convert={() => {
      const {config, dropped} = levelConfigFromFlat(flatProperties);
      REPLACED_SECTIONS.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
          section.style.display = 'none';
        }
      });
      return {value: config, dropped};
    }}
    // Switching on "Limit what the student can change" starts the list with
    // the parts the student can change now.
    featureStart={(path, value) =>
      path === 'edits' ? editableParts(value as LevelConfig) : undefined
    }
    renderPreview={(value, valid) => (
      <LevelPreviewFrame
        levelUrl={`/levels/${levelId}`}
        value={value}
        valid={valid}
      />
    )}
  />
);

export default EditSpritelabConfig;
