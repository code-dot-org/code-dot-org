import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';

import {expect} from '../../util/reconfiguredChai';

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
    expect(chips).to.exist;
    expect(screen.getByText('Chips label')).to.exist;
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
    expect(chips).to.exist;
    expect(screen.queryByText('Chips label')).to.be.null;
  });

  it('Chips - checks chip on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

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
    expect(chips).to.exist;

    let chip1 = screen.getByDisplayValue('chip1');
    let chip2 = screen.getByDisplayValue('chip2');
    let chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).to.be.false;
    expect(chip2.checked).to.be.false;
    expect(chip3.checked).to.be.false;

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

    expect(chip1.checked).to.be.true;
    expect(chip2.checked).to.be.false;
    expect(chip3.checked).to.be.false;
    expect(spyOnChange).to.have.been.calledOnce;

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

    expect(chip1.checked).to.be.true;
    expect(chip2.checked).to.be.true;
    expect(chip3.checked).to.be.false;
    expect(spyOnChange).to.have.been.calledTwice;

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

    expect(chip1.checked).to.be.false;
    expect(chip2.checked).to.be.true;
    expect(chip3.checked).to.be.false;
    expect(spyOnChange).to.have.been.calledThrice;
  });

  it('Chips - toggles required on click correctly', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

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
    expect(chips).to.exist;

    let chip1 = screen.getByDisplayValue('chip1');
    let chip2 = screen.getByDisplayValue('chip2');
    let chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).to.be.false;
    expect(chip1.required).to.be.true;
    expect(chip2.checked).to.be.false;
    expect(chip2.required).to.be.true;
    expect(chip3.checked).to.be.false;
    expect(chip3.required).to.be.true;

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

    expect(chip1.checked).to.be.true;
    expect(chip1.required).to.be.false;
    expect(chip2.checked).to.be.false;
    expect(chip2.required).to.be.false;
    expect(chip3.checked).to.be.false;
    expect(chip3.required).to.be.false;

    expect(spyOnChange).to.have.been.calledOnce;

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

    expect(chip1.checked).to.be.false;
    expect(chip1.required).to.be.true;
    expect(chip2.checked).to.be.false;
    expect(chip2.required).to.be.true;
    expect(chip3.checked).to.be.false;
    expect(chip3.required).to.be.true;
    expect(spyOnChange).to.have.been.calledTwice;
  });

  it('Chips - doesn`t check chip on click if disabled', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

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
    expect(chips).to.exist;

    let chip1 = screen.getByDisplayValue('chip1');
    let chip2 = screen.getByDisplayValue('chip2');
    let chip3 = screen.getByDisplayValue('chip3');

    expect(chip1.checked).to.be.false;
    expect(chip1.disabled).to.be.true;
    expect(chip2.checked).to.be.false;
    expect(chip2.disabled).to.be.true;
    expect(chip3.checked).to.be.false;
    expect(chip3.disabled).to.be.true;

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

    expect(chip1.checked).to.be.false;
    expect(chip1.disabled).to.be.true;
    expect(chip2.checked).to.be.false;
    expect(chip2.disabled).to.be.true;
    expect(chip3.checked).to.be.false;
    expect(spyOnChange).to.not.have.been.called;

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

    expect(chip1.checked).to.be.false;
    expect(chip1.disabled).to.be.true;
    expect(chip2.checked).to.be.false;
    expect(chip2.disabled).to.be.true;
    expect(chip3.checked).to.be.false;
    expect(spyOnChange).to.not.have.been.called;

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

    expect(chip1.checked).to.be.false;
    expect(chip2.checked).to.be.false;
    expect(chip2.disabled).to.be.true;
    expect(chip3.checked).to.be.false;
    expect(spyOnChange).to.not.have.been.called;
  });
});
