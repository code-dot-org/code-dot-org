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
    expect(chip2.checked).to.be.false;

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

    // // Initial render
    // const {rerender} = render(
    //   <Checkbox
    //     name="test-checkbox"
    //     value="test-checkbox"
    //     label="Checkbox label"
    //     checked={checked}
    //     onChange={onChange}
    //   />
    // );
    //
    // let checkbox = screen.getByDisplayValue('test-checkbox');
    // expect(checkbox).to.exist;
    //
    // expect(checkbox.checked).to.be.false;
    // expect(checkbox.disabled).to.be.false;
    // expect(checkbox.indeterminate).to.be.false;
    //
    // await user.click(checkbox);
    //
    // // Re-render after user's first click
    // rerender(
    //   <Checkbox
    //     name="test-checkbox"
    //     value="test-checkbox"
    //     label="Checkbox label"
    //     checked={checked}
    //     onChange={onChange}
    //   />
    // );
    //
    // checkbox = screen.getByDisplayValue('test-checkbox');
    //
    // expect(spyOnChange).to.have.been.calledOnce;
    // expect(spyOnChange).to.have.been.calledWith(true);
    // expect(checkbox.checked).to.be.true;
    // expect(checkbox.disabled).to.be.false;
    // expect(checkbox.indeterminate).to.be.false;
    //
    // await user.click(checkbox);
    //
    // // Re-render after user's second click
    // rerender(
    //   <Checkbox
    //     name="test-checkbox"
    //     value="test-checkbox"
    //     label="Checkbox label"
    //     checked={checked}
    //     onChange={onChange}
    //   />
    // );
    //
    // checkbox = screen.getByDisplayValue('test-checkbox');
    //
    // expect(spyOnChange).to.have.been.calledTwice;
    // expect(spyOnChange).to.have.been.calledWith(false);
    // expect(checkbox.checked).to.be.false;
    // expect(checkbox.disabled).to.be.false;
    // expect(checkbox.indeterminate).to.be.false;
  });

  // it('Checkbox - changes checked state on click', async () => {
  //   const user = userEvent.setup();
  //   const spyOnChange = sinon.spy();
  //
  //   let checked = false;
  //   const onChange = () => {
  //     checked = !checked;
  //     spyOnChange(checked);
  //   };
  //
  //   // Initial render
  //   const {rerender} = render(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   let checkbox = screen.getByDisplayValue('test-checkbox');
  //   expect(checkbox).to.exist;
  //
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.false;
  //   expect(checkbox.indeterminate).to.be.false;
  //
  //   await user.click(checkbox);
  //
  //   // Re-render after user's first click
  //   rerender(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   checkbox = screen.getByDisplayValue('test-checkbox');
  //
  //   expect(spyOnChange).to.have.been.calledOnce;
  //   expect(spyOnChange).to.have.been.calledWith(true);
  //   expect(checkbox.checked).to.be.true;
  //   expect(checkbox.disabled).to.be.false;
  //   expect(checkbox.indeterminate).to.be.false;
  //
  //   await user.click(checkbox);
  //
  //   // Re-render after user's second click
  //   rerender(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //     />
  //   );
  //
  //   checkbox = screen.getByDisplayValue('test-checkbox');
  //
  //   expect(spyOnChange).to.have.been.calledTwice;
  //   expect(spyOnChange).to.have.been.calledWith(false);
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.false;
  //   expect(checkbox.indeterminate).to.be.false;
  // });
  //
  // it('Checkbox - renders indeterminate checkbox, changes on click', async () => {
  //   const user = userEvent.setup();
  //   const spyOnChange = sinon.spy();
  //
  //   let checked = false;
  //   let indeterminate = true;
  //   const onChange = () => {
  //     if (indeterminate) {
  //       // Default browser behavior for clicking an indeterminate checkbox.
  //       indeterminate = false;
  //       checked = true;
  //     } else {
  //       checked = !checked;
  //     }
  //     spyOnChange(checked);
  //   };
  //
  //   // Initial render
  //   const {rerender} = render(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //       indeterminate={indeterminate}
  //     />
  //   );
  //
  //   let checkbox = screen.getByDisplayValue('test-checkbox');
  //   expect(checkbox).to.exist;
  //
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.false;
  //   expect(checkbox.indeterminate).to.be.true;
  //
  //   await user.click(checkbox);
  //
  //   // Re-render after user's first click
  //   rerender(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //       indeterminate={indeterminate}
  //     />
  //   );
  //
  //   checkbox = screen.getByDisplayValue('test-checkbox');
  //
  //   expect(spyOnChange).to.have.been.calledOnce;
  //   expect(spyOnChange).to.have.been.calledWith(true);
  //   expect(checkbox.checked).to.be.true;
  //   expect(checkbox.disabled).to.be.false;
  //   expect(checkbox.indeterminate).to.be.false;
  //
  //   await user.click(checkbox);
  //
  //   // Re-render after user's second click
  //   rerender(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //       indeterminate={indeterminate}
  //     />
  //   );
  //
  //   checkbox = screen.getByDisplayValue('test-checkbox');
  //
  //   expect(spyOnChange).to.have.been.calledTwice;
  //   expect(spyOnChange).to.have.been.calledWith(false);
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.false;
  //   expect(checkbox.indeterminate).to.be.false;
  // });
  //
  // it("Checkbox - renders disabled checkbox, doesn't change on click", async () => {
  //   const user = userEvent.setup();
  //   const spyOnChange = sinon.spy();
  //
  //   let checked = false;
  //   const onChange = () => {
  //     checked = !checked;
  //     spyOnChange(checked);
  //   };
  //
  //   // Initial render
  //   const {rerender} = render(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //       disabled={true}
  //     />
  //   );
  //
  //   let checkbox = screen.getByDisplayValue('test-checkbox');
  //   expect(checkbox).to.exist;
  //
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.true;
  //   expect(checkbox.indeterminate).to.be.false;
  //
  //   await user.click(checkbox);
  //
  //   // Re-render after user's first click
  //   rerender(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //       disabled={true}
  //     />
  //   );
  //
  //   checkbox = screen.getByDisplayValue('test-checkbox');
  //
  //   expect(spyOnChange).to.not.have.been.called;
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.true;
  //   expect(checkbox.indeterminate).to.be.false;
  //
  //   await user.click(checkbox);
  //
  //   // Re-render after user's second click
  //   rerender(
  //     <Checkbox
  //       name="test-checkbox"
  //       value="test-checkbox"
  //       label="Checkbox label"
  //       checked={checked}
  //       onChange={onChange}
  //       disabled={true}
  //     />
  //   );
  //
  //   expect(spyOnChange).to.not.have.been.called;
  //   expect(checkbox.checked).to.be.false;
  //   expect(checkbox.disabled).to.be.true;
  //   expect(checkbox.indeterminate).to.be.false;
  // });
});
