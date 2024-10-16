import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Chips from '@cdo/apps/componentLibrary/chips';

const options = [
  {value: 'chip1', label: 'Chip1'},
  {value: 'chip2', label: 'Chip2'},
  {value: 'chip3', label: 'Chip3'},
];
let values = [];

describe('Design System - Chips', () => {
  it('Chips - renders with correct label', () => {
    render(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        setValues={newValues => (values = newValues)}
        label="Chips label"
      />
    );

    const chips = screen.getByTestId('chips-test-chips');
    expect(chips).toBeDefined();
    expect(screen.getByText('Chips label')).toBeDefined();
  });

  it('Chips - doesn`t render label if it`s not specidied', () => {
    render(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        setValues={newValues => (values = newValues)}
      />
    );

    const chips = screen.getByTestId('chips-test-chips');
    expect(chips).toBeDefined();
    expect(screen.queryByText('Chips label')).toBeNull();
  });

  it('Chips - checks chip on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let values = [];
    const setValues = newValues => {
      values = newValues;
      spyOnChange(newValues);
    };

    const {rerender} = render(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        setValues={setValues}
        label="Chips label"
      />
    );

    const chips = screen.getByTestId('chips-test-chips');
    expect(chips).toBeDefined();

    let chip1 = screen.getByDisplayValue('chip1');
    let chip2 = screen.getByDisplayValue('chip2');
    let chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(false);
    expect(chip2.checked).toBe(false);
    expect(chip3.checked).toBe(false);

    await user.click(chip1);

    rerender(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        setValues={setValues}
        label="Chips label"
      />
    );

    chip1 = screen.getByDisplayValue('chip1');
    chip2 = screen.getByDisplayValue('chip2');
    chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(true);
    expect(chip2.checked).toBe(false);
    expect(chip3.checked).toBe(false);
    expect(spyOnChange).toHaveBeenCalledTimes(1);

    await user.click(chip2);

    rerender(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        setValues={setValues}
        label="Chips label"
      />
    );

    chip1 = screen.getByDisplayValue('chip1');
    chip2 = screen.getByDisplayValue('chip2');
    chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(true);
    expect(chip2.checked).toBe(true);
    expect(chip3.checked).toBe(false);
    expect(spyOnChange).toHaveBeenCalledTimes(2);

    await user.click(chip1);

    rerender(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        setValues={setValues}
        label="Chips label"
      />
    );

    chip1 = screen.getByDisplayValue('chip1');
    chip2 = screen.getByDisplayValue('chip2');
    chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(false);
    expect(chip2.checked).toBe(true);
    expect(chip3.checked).toBe(false);
    expect(spyOnChange).toHaveBeenCalledTimes(3);
  });

  it('Chips - toggles required on click correctly', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let values = [];
    const setValues = newValues => {
      values = newValues;
      spyOnChange(newValues);
    };

    const {rerender} = render(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        required={true}
        setValues={setValues}
        label="Chips label"
      />
    );

    const chips = screen.getByTestId('chips-test-chips');
    expect(chips).toBeDefined();

    let chip1 = screen.getByDisplayValue('chip1');
    let chip2 = screen.getByDisplayValue('chip2');
    let chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(false);
    expect(chip1.required).toBe(true);
    expect(chip2.checked).toBe(false);
    expect(chip2.required).toBe(true);
    expect(chip3.checked).toBe(false);
    expect(chip3.required).toBe(true);

    await user.click(chip1);

    rerender(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        required={true}
        setValues={setValues}
        label="Chips label"
      />
    );

    chip1 = screen.getByDisplayValue('chip1');
    chip2 = screen.getByDisplayValue('chip2');
    chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(true);
    expect(chip1.required).toBe(false);
    expect(chip2.checked).toBe(false);
    expect(chip2.required).toBe(false);
    expect(chip3.checked).toBe(false);
    expect(chip3.required).toBe(false);

    expect(spyOnChange).toHaveBeenCalledTimes(1);

    await user.click(chip1);

    rerender(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        required={true}
        setValues={setValues}
        label="Chips label"
      />
    );

    chip1 = screen.getByDisplayValue('chip1');
    chip2 = screen.getByDisplayValue('chip2');
    chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(false);
    expect(chip1.required).toBe(true);
    expect(chip2.checked).toBe(false);
    expect(chip2.required).toBe(true);
    expect(chip3.checked).toBe(false);
    expect(chip3.required).toBe(true);
    expect(spyOnChange).toHaveBeenCalledTimes(2);
  });

  it('Chips - doesn`t check chip on click if disabled', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let values = [];
    const setValues = newValues => {
      values = newValues;
      spyOnChange(newValues);
    };

    const {rerender} = render(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        setValues={setValues}
        label="Chips label"
        disabled={true}
      />
    );

    const chips = screen.getByTestId('chips-test-chips');
    expect(chips).toBeDefined();

    let chip1 = screen.getByDisplayValue('chip1');
    let chip2 = screen.getByDisplayValue('chip2');
    let chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(false);
    expect(chip1.disabled).toBe(true);
    expect(chip2.checked).toBe(false);
    expect(chip2.disabled).toBe(true);
    expect(chip3.checked).toBe(false);
    expect(chip3.disabled).toBe(true);

    await user.click(chip1);

    rerender(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        setValues={setValues}
        label="Chips label"
        disabled={true}
      />
    );

    chip1 = screen.getByDisplayValue('chip1');
    chip2 = screen.getByDisplayValue('chip2');
    chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(false);
    expect(chip1.disabled).toBe(true);
    expect(chip2.checked).toBe(false);
    expect(chip2.disabled).toBe(true);
    expect(chip3.checked).toBe(false);
    expect(spyOnChange).not.toHaveBeenCalled();

    await user.click(chip2);

    rerender(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        setValues={setValues}
        label="Chips label"
        disabled={true}
      />
    );

    chip1 = screen.getByDisplayValue('chip1');
    chip2 = screen.getByDisplayValue('chip2');
    chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(false);
    expect(chip1.disabled).toBe(true);
    expect(chip2.checked).toBe(false);
    expect(chip2.disabled).toBe(true);
    expect(chip3.checked).toBe(false);
    expect(spyOnChange).not.toHaveBeenCalled();

    await user.click(chip1);

    rerender(
      <Chips
        name="test-chips"
        values={values}
        options={options}
        setValues={setValues}
        label="Chips label"
        disabled={true}
      />
    );

    chip1 = screen.getByDisplayValue('chip1');
    chip2 = screen.getByDisplayValue('chip2');
    chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).toBe(false);
    expect(chip2.checked).toBe(false);
    expect(chip2.disabled).toBe(true);
    expect(chip3.checked).toBe(false);
    expect(spyOnChange).not.toHaveBeenCalled();
  });
});
