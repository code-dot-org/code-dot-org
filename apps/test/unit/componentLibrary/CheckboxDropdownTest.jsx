import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';

import {expect} from '../../util/reconfiguredChai';

import CheckboxDropdown from '@cdo/apps/componentLibrary/checkboxDropdown';

const allOptions = [
  {value: 'option-1', label: 'option1'},
  {value: 'option-2', label: 'option2'},
  {value: 'option-3', label: 'option3'},
];
let selectedValues = [];
const onChceckboxDropdownChange = (value, isChecked) => {
  if (isChecked) {
    selectedValues.push(value);
  } else {
    selectedValues = selectedValues.filter(v => v !== value);
  }
};
const handleSelectAll = () => {
  selectedValues = allOptions.map(option => option.value);
};
const handleClearAll = () => (selectedValues = []);

describe('Design System - Checkbox Dropdown Component', () => {
  beforeEach(() => {
    handleClearAll();
  });

  it('Checkbox Dropdown - renders with correct text and options', () => {
    render(
      <CheckboxDropdown
        name="test1-dropdown"
        allOptions={allOptions}
        selectedValues={selectedValues}
        onChange={e =>
          onChceckboxDropdownChange(e.target.value, e.target.checked)
        }
        handleSelectAll={handleSelectAll}
        handleClearAll={handleClearAll}
        labelText="Dropdown label"
      />
    );

    const label = screen.getByText('Dropdown label');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');
    const option3 = screen.getByText('option3');

    expect(label).to.exist;
    expect(option1).to.exist;
    expect(option2).to.exist;
    expect(option3).to.exist;
  });

  it('Checkbox Dropdown - renders with correct text and options, changes selected value on when one is selected', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    const onChange = e => {
      onChceckboxDropdownChange(e.target.value, e.target.checked);
      spyOnChange(e.target.value, e.target.checked);
    };
    const DropdownToRender = () => (
      <CheckboxDropdown
        name="test2-dropdown"
        allOptions={allOptions}
        selectedValues={selectedValues}
        onChange={onChange}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const selectElement = screen.getByRole('combobox');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    expect(label).to.exist;
    expect(selectElement).to.exist;
    expect(option1).to.exist;
    expect(option2).to.exist;
    expect(selectedValues).length.to.equal(0);

    await user.selectOptions(selectElement, 'option-1');

    rerender(<DropdownToRender />);

    expect(spyOnChange).to.have.been.calledOnce;
    expect(spyOnChange).to.have.been.calledWith('option-1');
    expect(selectedValues[0]).to.equal('option-1');
    expect(selectedValues).length.to.equal(1);

    await user.selectOptions(selectElement, 'option-2');

    rerender(<DropdownToRender />);

    expect(spyOnChange).to.have.been.calledTwice;
    expect(spyOnChange).to.have.been.calledWith('option-2');
    expect(selectedValues[1]).to.equal('option-2');
    expect(selectedValues).length.to.equal(2);
  });

  it("Checkbox Dropdown - renders disabled dropdown, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    const onChange = e => {
      onChceckboxDropdownChange(e.target.value, e.target.checked);
      spyOnChange(e.target.value, e.target.checked);
    };

    const DropdownToRender = () => (
      <CheckboxDropdown
        name="test2-dropdown"
        disabled={true}
        allOptions={allOptions}
        selectedValues={selectedValues}
        onChange={onChange}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const selectElement = screen.getByRole('combobox');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    expect(label).to.exist;
    expect(selectElement).to.exist;
    expect(option1).to.exist;
    expect(option2).to.exist;
    expect(selectedValues).length.to.equal(0);

    await user.selectOptions(selectElement, 'option-1');

    rerender(<DropdownToRender />);

    expect(spyOnChange).to.have.not.been.called;
    expect(selectedValues).length.to.equal(0);

    await user.selectOptions(selectElement, 'option-2');

    rerender(<DropdownToRender />);

    expect(spyOnChange).to.have.not.been.called;
    expect(selectedValues).length.to.equal(0);
  });

  it('Checkbox Dropdown - handles Select all and Clear all clicks', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    const onChange = e => {
      onChceckboxDropdownChange(e.target.value, e.target.checked);
      spyOnChange(e.target.value, e.target.checked);
    };

    const DropdownToRender = () => (
      <CheckboxDropdown
        name="test2-dropdown"
        disabled={true}
        allOptions={allOptions}
        selectedValues={selectedValues}
        onChange={onChange}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);
    await user.click();
    rerender(<DropdownToRender />);
    //TODO: implement this test
  });

  it('Checkbox Dropdown - shows/hides check icon depending on checkbox dropdown selectedValues change', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    const onChange = e => {
      onChceckboxDropdownChange(e.target.value, e.target.checked);
      spyOnChange(e.target.value, e.target.checked);
    };

    const DropdownToRender = () => (
      <CheckboxDropdown
        name="test2-dropdown"
        disabled={true}
        allOptions={allOptions}
        selectedValues={selectedValues}
        onChange={onChange}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);
    await user.click();
    rerender(<DropdownToRender />);
    //TODO: implement this test
  });
});
