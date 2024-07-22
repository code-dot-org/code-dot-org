import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon';

import {ActionDropdown} from '@cdo/apps/componentLibrary/dropdown';

import {expect} from '../../util/reconfiguredChai';

const allOptions = [
  {
    value: 'option-1',
    label: 'option1',
    icon: {iconName: 'check', iconStyle: 'solid'},
  },
  {
    value: 'option-2',
    label: 'option2',
    icon: {iconName: 'check', iconStyle: 'solid'},
  },
  {
    value: 'option-3',
    label: 'option3',
    icon: {iconName: 'check', iconStyle: 'solid'},
  },
];
let selectedValue = {};
const onActionDropdownChange = option => {
  selectedValue = option;
};

describe('Design System - Action Dropdown Component', () => {
  beforeEach(() => {
    onActionDropdownChange({});
  });

  it('Action Dropdown - renders with correct text and options', () => {
    render(
      <ActionDropdown
        name="test1-dropdown"
        options={allOptions}
        selectedOption={selectedValue}
        onChange={onActionDropdownChange}
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

  it('Action Dropdown - renders with correct text and options, changes selected value on when one is selected', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    const onChange = option => {
      onActionDropdownChange(option);
      spyOnChange(option);
    };
    const DropdownToRender = () => (
      <ActionDropdown
        name="test2-dropdown"
        options={allOptions}
        selectedOption={selectedValue}
        onChange={onChange}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    expect(label).to.exist;
    expect(option1).to.exist;
    expect(option2).to.exist;
    expect(selectedValue.value).to.equal(undefined);

    await user.click(option1);

    rerender(<DropdownToRender />);

    expect(spyOnChange).to.have.been.calledOnce;
    expect(selectedValue.value).to.equal('option-1');

    await user.click(option2);

    rerender(<DropdownToRender />);

    expect(spyOnChange).to.have.been.calledTwice;
    expect(selectedValue.value).to.equal('option-2');
  });

  it("Action Dropdown - renders disabled dropdown, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();
    const onChange = option => {
      onActionDropdownChange(option);
      spyOnChange(option);
    };

    const DropdownToRender = () => (
      <ActionDropdown
        name="test2-dropdown"
        disabled={true}
        options={allOptions}
        selectedOption={selectedValue}
        onChange={onChange}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    expect(label).to.exist;
    expect(option1).to.exist;
    expect(option2).to.exist;
    expect(selectedValue.value).to.equal(undefined);

    await user.click(option1);

    rerender(<DropdownToRender />);

    expect(spyOnChange).to.have.not.been.called;
    expect(selectedValue.value).to.equal(undefined);

    await user.click(option2);

    rerender(<DropdownToRender />);

    expect(spyOnChange).to.have.not.been.called;
    expect(selectedValue.value).to.equal(undefined);
  });
});
