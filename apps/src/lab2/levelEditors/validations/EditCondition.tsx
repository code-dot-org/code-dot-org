import React, {useEffect} from 'react';

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

  const hasValue = currentConditionType?.valueType !== undefined;
  const isNumeric = currentConditionType?.valueType === 'number';
  const isString = currentConditionType?.valueType === 'string';
  const useInput = isNumeric || isString;

  const useDropdown = currentConditionType?.valueType === 'array';
  const dropdownOptions = currentConditionType?.valueOptions || [''];
  const initialDropdownValue = dropdownOptions[0];

  // Ensure that conditions with dropdowns have a value set
  useEffect(() => {
    if (hasValue && useDropdown && condition.value === undefined) {
      condition.value = initialDropdownValue;
      onConditionChange(condition, index);
    }
  }, [
    hasValue,
    condition,
    initialDropdownValue,
    index,
    useDropdown,
    onConditionChange,
  ]);

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
          {useInput && (
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
          )}
          {useDropdown && (
            <select
              className={moduleStyles.conditionValueDropdown}
              name="conditionValue"
              id="conditionValue"
              value={condition.value || dropdownOptions[0]}
              onChange={e => {
                condition.value = e.target.value;
                onConditionChange(condition, index);
              }}
            >
              {dropdownOptions.map((option, index) => {
                return (
                  <option key={index} value={option}>
                    {option}
                  </option>
                );
              })}
            </select>
          )}
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
