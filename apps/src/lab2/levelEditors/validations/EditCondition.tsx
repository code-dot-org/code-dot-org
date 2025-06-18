import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {CSSObject} from '@emotion/serialize';
import React, {useEffect} from 'react';
import Select, {
  components,
  SingleValueProps,
  OptionProps,
} from 'react-select-5';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import Tooltip from '@cdo/apps/templates/Tooltip';

import {Condition, ConditionType} from '../../types';

import moduleStyles from './edit-validations.module.scss';

const SingleValue = (props: SingleValueProps<{value: string}>) => (
  <components.SingleValue {...props}>{props.data.value}</components.SingleValue>
);

const Option = (props: OptionProps<{value: string; description: string}>) => {
  return (
    <components.Option {...props}>
      <b>{props.data.value}</b> &mdash; {props.data.description}
    </components.Option>
  );
};

function getConditionPart(
  value: string | number,
  index: number
): string | number {
  const parts = typeof value === 'string' ? value.split(':') : [value];
  return parts[index];
}

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
  const valueType = currentConditionType?.valueType;
  const hasValueType = valueType !== undefined;
  const valueTypes = React.useMemo(
    () => valueType?.split(':') || [],
    [valueType]
  );
  const useDropdown = !!currentConditionType?.valueOptions;
  const dropdownOptions = currentConditionType?.valueOptions || [''];
  const initialDropdownValue = dropdownOptions[0];

  const handleValueChange = (
    newPart: string | number,
    valueIndex: number,
    isNumber: boolean = false
  ) => {
    const currentValues =
      typeof condition.value === 'string'
        ? condition.value.split(':')
        : [condition.value];

    const newCondition = {...condition};

    currentValues[valueIndex] = newPart;
    newCondition.value = currentValues.join(':');
    if (isNumber && !isNaN(Number(newCondition.value))) {
      newCondition.value = parseInt(newCondition.value);
    }
    onConditionChange(newCondition, index);
  };

  useEffect(() => {
    if (hasValueType && useDropdown && condition.value === undefined) {
      const defaultParts = valueTypes.map(type =>
        type === 'number' ? 1 : initialDropdownValue
      );
      const newValue = defaultParts.join(':');
      onConditionChange({...condition, value: newValue}, index);
    }
  }, [
    hasValueType,
    valueTypes,
    condition,
    initialDropdownValue,
    index,
    currentConditionType,
    onConditionChange,
    useDropdown,
  ]);

  const conditionDescription = conditionTypes.find(
    type => type.name === condition.name
  )?.description;

  const options = conditionTypes.map(conditionType => ({
    value: conditionType.name,
    description: conditionType.description,
  }));

  return (
    <div className={moduleStyles.row}>
      <Select
        styles={{
          container: (baseStyles: CSSObject) => ({
            ...baseStyles,
            width: 220,
          }),
          menu: (baseStyles: CSSObject) => ({
            ...baseStyles,
            width: 600,
            border: 'solid 1px #000',
            boxShadow:
              'rgba(0, 0, 0, 0.3) 0px 20px 40px, rgba(0, 0, 0, 0.2) 0px 15px 15px',
          }),
        }}
        options={options}
        components={{SingleValue, Option}}
        defaultValue={options.find(option => option.value === condition.name)}
        onChange={(option: {value: string}) => {
          condition.name = option.value;
          condition.value = undefined;
          if (!hasValueType) {
            condition.value = undefined;
          }
          onConditionChange(condition, index);
        }}
      />
      <Tooltip text={conditionDescription} place="bottom">
        <FontAwesomeV6Icon iconName="circle-info" iconStyle="regular" />
      </Tooltip>
      {hasValueType && (
        <>
          <div className={moduleStyles.valueInputsWrapper}>
            {valueTypes.map((type, i) => {
              const currentConditionValue = condition.value!;
              const currentValue = getConditionPart(currentConditionValue, i);

              const isNumber = type === 'number';
              const isString = type === 'string';
              if (isNumber || (isString && !useDropdown)) {
                return (
                  <input
                    key={`${condition.name}-${i}`}
                    type={isNumber ? 'number' : 'text'}
                    className={
                      isNumber
                        ? moduleStyles.conditionValueInputNumber
                        : undefined
                    }
                    value={currentValue}
                    onChange={e =>
                      handleValueChange(e.target.value, i, isNumber)
                    }
                  />
                );
              }

              if (useDropdown) {
                return (
                  <select
                    key={i}
                    value={currentValue || dropdownOptions[0]}
                    onChange={e => handleValueChange(e.target.value, i)}
                  >
                    {dropdownOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                );
              }

              return null;
            })}
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
