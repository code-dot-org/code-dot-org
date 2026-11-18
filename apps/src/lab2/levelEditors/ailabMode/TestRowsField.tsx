import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import React, {useEffect, useRef, useState} from 'react';

import {DEFAULT_TEST_ROWS_PERCENT} from '@cdo/apps/ailab/engine';

import {
  getTestRowsAmount,
  getTestRowsUnit,
  isValidTestRowsAmount,
  ModeObject,
  setTestRows,
  TestRowsUnit,
} from './ailabMode';

import moduleStyles from './edit-ailab-mode.module.scss';

const UNIT_ITEMS: {value: TestRowsUnit; text: string}[] = [
  {value: 'percent', text: 'A percentage of the rows'},
  {value: 'count', text: 'A number of rows'},
];

const AMOUNT_FIELDS: Record<
  TestRowsUnit,
  {
    label: string;
    error: string;
    min: number;
    max?: number;
    step: number | 'any';
  }
> = {
  percent: {
    label: 'Percentage of rows to test on',
    error: 'Enter a number above 0 and below 100.',
    min: 0,
    max: 100,
    step: 'any',
  },
  count: {
    label: 'Number of rows to test on',
    error: 'Enter a whole number of at least 1.',
    min: 1,
    step: 1,
  },
};

const isBlank = (text: string) => text.trim() === '';

const isValidAmountText = (unit: TestRowsUnit, text: string) =>
  !isBlank(text) && isValidTestRowsAmount(unit, Number(text));

interface TestRowsFieldProps {
  mode: ModeObject;
  disabled: boolean;
  onChange: (mode: ModeObject) => void;
}

const TestRowsField: React.FunctionComponent<TestRowsFieldProps> = ({
  mode,
  disabled,
  onChange,
}) => {
  const [unit, setUnit] = useState(() => getTestRowsUnit(mode));
  const [text, setText] = useState(() => String(getTestRowsAmount(mode) ?? ''));
  const amountField = AMOUNT_FIELDS[unit];
  const error =
    !isBlank(text) && !isValidAmountText(unit, text)
      ? amountField.error
      : undefined;
  const amountRef = useRef<HTMLInputElement>(null);

  // The native limits allow 0 and 100%, which would save as the default.
  useEffect(() => {
    amountRef.current!.setCustomValidity(error ?? '');
  }, [error]);

  const update = (newUnit: TestRowsUnit, newText: string) => {
    setUnit(newUnit);
    setText(newText);
    onChange(
      setTestRows(
        mode,
        newUnit,
        isValidAmountText(newUnit, newText) ? Number(newText) : undefined
      )
    );
  };

  return (
    <>
      <SimpleDropdown
        labelText="Test on"
        name="ailab_mode_test_rows_unit"
        items={UNIT_ITEMS}
        selectedValue={unit}
        onChange={e => update(e.target.value as TestRowsUnit, text)}
        disabled={disabled}
        size="s"
      />
      <div className={moduleStyles.testRowsAmount}>
        <TextField
          ref={amountRef}
          label={amountField.label}
          name="ailab_mode_test_rows"
          inputType="number"
          min={amountField.min}
          max={amountField.max}
          step={amountField.step}
          value={text}
          onChange={e => update(unit, e.target.value)}
          disabled={disabled}
          helperMessage={`Each training run tests the model on these rows and trains on the rest, always keeping at least one row to train on. Leave blank for ${DEFAULT_TEST_ROWS_PERCENT}%.`}
          errorMessage={error}
          size="s"
        />
      </div>
    </>
  );
};

export default TestRowsField;
