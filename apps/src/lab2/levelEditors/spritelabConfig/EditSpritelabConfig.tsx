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

// The older editors this one replaces, hidden once a level is converted.
const REPLACED_SECTIONS = ['level_mode_area', 'spritelab2_extra_properties'];

interface EditSpritelabConfigProps {
  levelId: number;
  initialConfig: unknown;
  /** The level's older settings, by their names in the lab. */
  flatProperties: FlatProperties;
}

const EditSpritelabConfig: React.FunctionComponent<
  EditSpritelabConfigProps
> = ({levelId, initialConfig, flatProperties}) => (
  <LevelConfigEditor
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
    // A level that starts limiting what the student changes starts from
    // what they change now.
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
