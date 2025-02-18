import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';

import {Condition, ConditionType, ConditionValueJson} from '../../types';

import moduleStyles from './edit-validations.module.scss';

interface EditConditionProps {
  condition: Condition;
  conditionTypes: ConditionType[];
  index: number;
  onConditionChange: (condition: Condition, index: number) => void;
  deleteCondition: (index: number) => void;
}

/**
 * Editor for a single validation condition.
 */
const EditCondition: React.FunctionComponent<EditConditionProps> = ({
  condition,
  conditionTypes,
  index,
  onConditionChange,
  deleteCondition,
}) => {
  const currentConditionType = conditionTypes.find(conditionType => {
    return conditionType.name === condition.name;
  });

  const isNumeric = currentConditionType?.valueType === 'number';
  const isJson = currentConditionType?.valueType === 'json';
  const hasValue = currentConditionType?.valueType !== undefined;

  return (
    <div className={moduleStyles.row}>
      <label htmlFor="conditionName" className={moduleStyles.label}>
        {'Condition ' + (index + 1) + ':'}
      </label>
      <select
        className={moduleStyles.conditionNameDropdown}
        name="conditionName"
        id="conditionName"
        value={condition.name}
        onChange={e => {
          condition.name = e.target.value;
          if (!hasValue) {
            condition.value = undefined;
          }
          onConditionChange(condition, index);
        }}
      >
        {conditionTypes.map((conditionType, index) => {
          return (
            <option key={index} value={conditionType.name}>
              {conditionType.name}
            </option>
          );
        })}
      </select>
      {hasValue && (
        <>
          <label htmlFor="conditionValue" className={moduleStyles.label}>
            Value:
          </label>
          <div>
            <input
              type={isNumeric ? 'number' : 'text'}
              name="conditionValue"
              id="conditionValue"
              value={
                isJson
                  ? JSON.stringify(condition.value)
                  : (condition.value as string)
              }
              onChange={e => {
                condition.value = isNumeric
                  ? parseInt(e.target.value)
                  : isJson && e.target.value
                  ? JSON.parse(e.target.value)
                  : e.target.value;
                onConditionChange(condition, index);
              }}
            />

            {hasValue &&
              isJson &&
              condition.name === 'played_sounds_in_sequence' &&
              condition.value && (
                <div className={moduleStyles.sequence}>
                  <label
                    htmlFor="conditionValue"
                    className={moduleStyles.label}
                  >
                    Sequence:
                  </label>
                  {(condition.value as ConditionValueJson)?.sequence?.map(
                    (value: string | string[], index: number) => {
                      return Array.isArray(value) ? (
                        <div key={index}>{value.join(' & ')}</div>
                      ) : (
                        <div key={index}>{value}</div>
                      );
                    }
                  )}
                </div>
              )}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => deleteCondition(index)}
        className={moduleStyles.deleteConditionButton}
      >
        <FontAwesome icon="trash" title={undefined} className="icon" />
      </button>
    </div>
  );
};

export default EditCondition;
