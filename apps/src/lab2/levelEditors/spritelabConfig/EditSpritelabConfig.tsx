// The levelbuilder form for a Sprite Lab in Lab2 level's level_config. It
// has no fields of its own: they are drawn from the lab's schema, so an
// option added there appears here.

import {Typography} from '@mui/material';
import React, {useMemo, useState} from 'react';

import {
  LevelConfig,
  levelConfigSchema,
  parseLevelConfig,
} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/schema';

import {describeSchema} from '../schemaForm/describeSchema';
import SchemaForm, {FormValue} from '../schemaForm/SchemaForm';

import moduleStyles from '../schemaForm/schema-form.module.scss';

interface EditSpritelabConfigProps {
  /** The level's saved level_config, if it has one. */
  initialConfig: unknown;
  /** What the level's older properties say, in the same shape. */
  fromOlderProperties: LevelConfig;
}

const isObject = (value: unknown): value is FormValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const EditSpritelabConfig: React.FunctionComponent<
  EditSpritelabConfigProps
> = ({initialConfig, fromOlderProperties}) => {
  const fields = useMemo(() => describeSchema(levelConfigSchema), []);
  const [value, setValue] = useState<FormValue>(() =>
    isObject(initialConfig) ? initialConfig : {}
  );
  const problems = useMemo(
    () =>
      Object.fromEntries(
        parseLevelConfig(value).problems.map(problem => [
          problem.path,
          problem.message,
        ])
      ),
    [value]
  );
  const olderText = JSON.stringify(fromOlderProperties, null, 2);

  return (
    <div>
      <input
        id="level_level_config"
        name="level[level_config]"
        type="hidden"
        value={JSON.stringify(value)}
      />
      <Typography variant="body4" className={moduleStyles.help}>
        An experiment: the same settings as the level mode above, grouped by
        tab. What is set here wins over the older setting of the same meaning.
      </Typography>
      {olderText !== '{}' && (
        <details className={moduleStyles.field}>
          <summary>What this level's older settings say, in this shape</summary>
          <pre>{olderText}</pre>
        </details>
      )}
      <SchemaForm
        fields={fields}
        value={value}
        onChange={setValue}
        problems={problems}
      />
    </div>
  );
};

export default EditSpritelabConfig;
