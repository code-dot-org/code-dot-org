import Checkbox from '@code-dot-org/component-library/checkbox';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {modelDescriptions} from '@cdo/apps/aichat/constants';
import {
  AichatCapabilities,
  LevelAichatCapabilities,
} from '@cdo/apps/aichatLab/types';
import {getTypedKeys} from '@cdo/apps/types/utils';

import moduleStyles from './edit-aichat-capabilities.module.scss';

const CAPABILITY_LABELS: {[key in AichatCapabilities]: string} = {
  [AichatCapabilities.TEXT]: 'Text',
  [AichatCapabilities.IMAGE]: 'Image',
  [AichatCapabilities.FILES]: 'Files',
};
const ALL_CAPABILITIES = getTypedKeys(CAPABILITY_LABELS);

const DEFAULT_CAPABILITIES: LevelAichatCapabilities = {
  inputs: [AichatCapabilities.TEXT],
  outputs: [AichatCapabilities.TEXT],
};

type Direction = 'inputs' | 'outputs';

function modelSupports(
  modelId: string,
  direction: Direction,
  capability: AichatCapabilities
): boolean {
  const model = modelDescriptions.find(m => m.id === modelId);
  return Boolean(model?.modalities?.[direction]?.includes(capability));
}

function anyModelSupports(
  direction: Direction,
  capability: AichatCapabilities
): boolean {
  return modelDescriptions.some(m =>
    modelSupports(m.id, direction, capability)
  );
}

// Per-output allowlist of compatible inputs. An output not listed here permits
// all inputs. Add new safety constraints by tweaking this table.
const ALLOWED_INPUTS_FOR_OUTPUT: {
  [key in AichatCapabilities]?: AichatCapabilities[];
} = {
  // Image output is incompatible with image/files input for safety reasons.
  [AichatCapabilities.IMAGE]: [AichatCapabilities.TEXT],
};

function allowedInputsForOutput(
  output: AichatCapabilities
): AichatCapabilities[] {
  return ALLOWED_INPUTS_FOR_OUTPUT[output] ?? ALL_CAPABILITIES;
}

// A capability is blocked when its presence would violate any rule in the
// allowed-inputs-for-output table: an input is blocked if some selected output
// disallows it; an output is blocked if some selected input is disallowed for it.
function isBlocked(
  direction: Direction,
  capability: AichatCapabilities,
  capabilities: LevelAichatCapabilities
): boolean {
  if (direction === 'inputs') {
    return capabilities.outputs.some(
      o => !allowedInputsForOutput(o).includes(capability)
    );
  }
  return capabilities.inputs.some(
    i => !allowedInputsForOutput(capability).includes(i)
  );
}

const EditAichatCapabilities: React.FunctionComponent<{
  initialCapabilities: LevelAichatCapabilities | null;
}> = ({initialCapabilities}) => {
  const [capabilities, setCapabilities] = useState<LevelAichatCapabilities>(
    initialCapabilities || DEFAULT_CAPABILITIES
  );

  const toggle = (direction: Direction, capability: AichatCapabilities) => {
    const current = capabilities[direction];
    const next = current.includes(capability)
      ? current.filter(c => c !== capability)
      : [...current, capability];
    // Text is always enabled.
    if (!next.includes(AichatCapabilities.TEXT)) {
      next.push(AichatCapabilities.TEXT);
    }
    const updated = {...capabilities, [direction]: next};
    // Prune the opposite side of anything the new selection makes incompatible.
    const other: Direction = direction === 'inputs' ? 'outputs' : 'inputs';
    updated[other] = updated[other].filter(c => !isBlocked(other, c, updated));
    setCapabilities(updated);
  };

  const renderRow = (direction: Direction) => (
    <div className={moduleStyles.row}>
      <Typography variant="body2" className={moduleStyles.rowLabel}>
        {direction === 'inputs' ? 'Inputs' : 'Outputs'}
      </Typography>
      {ALL_CAPABILITIES.filter(c => anyModelSupports(direction, c)).map(
        capability => {
          const isText = capability === AichatCapabilities.TEXT;
          const blocked = isBlocked(direction, capability, capabilities);
          const checked = capabilities[direction].includes(capability);
          return (
            <label key={capability} className={moduleStyles.option}>
              <Checkbox
                name={`${direction}-${capability}`}
                checked={checked}
                disabled={isText || blocked}
                onChange={() => toggle(direction, capability)}
              />
              <span>{CAPABILITY_LABELS[capability]}</span>
            </label>
          );
        }
      )}
    </div>
  );

  return (
    <div>
      <input
        type="hidden"
        id="level_aichat_capabilities"
        name="level[aichat_capabilities]"
        value={JSON.stringify(capabilities)}
      />
      <Typography variant="body3" gutterBottom>
        Select which input and output modalities students may use on this level.
        Text is always enabled.
      </Typography>
      {renderRow('inputs')}
      {renderRow('outputs')}
    </div>
  );
};

export default EditAichatCapabilities;
