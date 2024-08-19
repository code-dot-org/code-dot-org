import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';

import {Condition, ConditionType} from '../../types';

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
          <input
            type={isNumeric ? 'number' : 'text'}
            name="conditionValue"
            id="conditionValue"
            value={condition.value}
            onChange={e => {
              condition.value = isNumeric
                ? parseInt(e.target.value)
                : e.target.value;
              onConditionChange(condition, index);
            }}
          />
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
