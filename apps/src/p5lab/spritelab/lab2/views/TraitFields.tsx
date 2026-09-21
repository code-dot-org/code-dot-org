import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';
import React from 'react';

import {ModelCard, TraitField} from '../ai/traits/modelCard';
import {mergeCostumeTraits, TraitValues} from '../ai/traits/traitStore';

import moduleStyles from './trait-editor.module.scss';

interface TraitFieldsProps {
  card: ModelCard;
  values: TraitValues | undefined;
  onChange: (values: TraitValues) => void;
  disabled?: boolean;
}

const EMPTY = '';

function rangeHint(field: TraitField): string | undefined {
  if (field.min === undefined || field.max === undefined) {
    return undefined;
  }
  return `${+field.min.toFixed(2)} to ${+field.max.toFixed(2)}`;
}

/**
 * One control per model feature. The model decides the controls, so a value
 * it cannot read is not expressible: a categorical feature offers that
 * feature's values and a continuous one a number bounded by the trained
 * range.
 */
const TraitFields: React.FunctionComponent<TraitFieldsProps> = ({
  card,
  values,
  onChange,
  disabled,
}) => (
  <>
    <div className={moduleStyles.heading}>{card.name} features</div>
    {card.fields.map(field => {
      const value = values?.[field.key];
      const shown = value === undefined ? EMPTY : String(value);
      const set = (next: string) =>
        onChange(mergeCostumeTraits(values, {[field.key]: next}));
      return (
        <div key={field.key} className={moduleStyles.row}>
          {field.kind === 'category' ? (
            <SimpleDropdown
              name={`trait-${field.key}`}
              labelText={field.id}
              size="s"
              disabled={disabled}
              selectedValue={shown}
              onChange={event => set(event.target.value)}
              items={[
                {value: EMPTY, text: 'not set'},
                ...(field.values || []).map(v => ({value: v, text: v})),
              ]}
            />
          ) : (
            <TextField
              name={`trait-${field.key}`}
              label={field.id}
              inputType="number"
              size="s"
              disabled={disabled}
              value={shown}
              placeholder={rangeHint(field)}
              onChange={event => set(event.target.value)}
            />
          )}
        </div>
      );
    })}
  </>
);

export default TraitFields;
