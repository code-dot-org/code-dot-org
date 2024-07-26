import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {RadioButtonsGroup} from '@cdo/apps/componentLibrary/radioButton';

const radioButtonsData = [
  {
    name: 'test-radioButton1',
    value: 'test-radioButton1',
    label: 'Radio Button1 label',
  },
  {
    name: 'test-radioButton2',
    value: 'test-radioButton2',
    label: 'Radio Button2 label',
  },
  {
    name: 'test-radioButton3',
    value: 'test-radioButton3',
    label: 'Radio Button3 label',
  },
];

describe('Design System - Radio Buttons Group', () => {
  it('RadioButtonsGroup - renders with correct label and correct selected by default radio', () => {
    render(
      <RadioButtonsGroup
        radioButtons={radioButtonsData}
        defaultValue={'test-radioButton2'}
      />
    );

    const radioButton1 = screen.getByDisplayValue('test-radioButton1');
    const radioButton2 = screen.getByDisplayValue('test-radioButton2');
    const radioButton3 = screen.getByDisplayValue('test-radioButton3');

    expect(radioButton1).toBeDefined();
    expect(radioButton2).toBeDefined();
    expect(radioButton3).toBeDefined();
    expect(screen.getByText(radioButtonsData[0].label)).toBeDefined();
    expect(screen.getByText(radioButtonsData[1].label)).toBeDefined();
    expect(screen.getByText(radioButtonsData[2].label)).toBeDefined();
    expect(radioButton1.checked).toBe(false);
    expect(radioButton2.checked).toBe(true);
    expect(radioButton3.checked).toBe(false);
  });

  it('RadioButtonsGroup - selects radio on click, can change selected button by clicking on other radio button ', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    const onChange = e => {
      spyOnChange(e.target.value);
    };

    // Initial render
    const {rerender} = render(
      <RadioButtonsGroup radioButtons={radioButtonsData} onChange={onChange} />
    );

    let radioButton1 = screen.getByDisplayValue('test-radioButton1');
    let radioButton2 = screen.getByDisplayValue('test-radioButton2');
    let radioButton3 = screen.getByDisplayValue('test-radioButton3');

    expect(radioButton1).toBeDefined();
    expect(radioButton1.checked).toBe(false);
    expect(radioButton1.disabled).toBe(false);

    expect(radioButton2).toBeDefined();
    expect(radioButton2.checked).toBe(false);
    expect(radioButton2.disabled).toBe(false);

    expect(radioButton3).toBeDefined();
    expect(radioButton3.checked).toBe(false);
    expect(radioButton3.disabled).toBe(false);

    await user.click(radioButton3);

    // Re-render after user's first click
    rerender(
      <RadioButtonsGroup radioButtons={radioButtonsData} onChange={onChange} />
    );

    radioButton1 = screen.getByDisplayValue('test-radioButton1');
    radioButton2 = screen.getByDisplayValue('test-radioButton2');
    radioButton3 = screen.getByDisplayValue('test-radioButton3');

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith('test-radioButton3');

    expect(radioButton1.checked).toBe(false);
    expect(radioButton1.disabled).toBe(false);
    expect(radioButton2.checked).toBe(false);
    expect(radioButton2.disabled).toBe(false);
    expect(radioButton3.checked).toBe(true);
    expect(radioButton3.disabled).toBe(false);

    await user.click(radioButton2);

    // Re-render after user's second click
    rerender(
      <RadioButtonsGroup radioButtons={radioButtonsData} onChange={onChange} />
    );

    radioButton1 = screen.getByDisplayValue('test-radioButton1');
    radioButton2 = screen.getByDisplayValue('test-radioButton2');
    radioButton3 = screen.getByDisplayValue('test-radioButton3');

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange).toHaveBeenCalledWith('test-radioButton2');

    expect(radioButton1.checked).toBe(false);
    expect(radioButton1.disabled).toBe(false);
    expect(radioButton2.checked).toBe(true);
    expect(radioButton2.disabled).toBe(false);
    expect(radioButton3.checked).toBe(false);
    expect(radioButton3.disabled).toBe(false);

    await user.click(radioButton2);

    // Re-render after user's third click (twice on the same radio button)
    rerender(
      <RadioButtonsGroup radioButtons={radioButtonsData} onChange={onChange} />
    );

    radioButton1 = screen.getByDisplayValue('test-radioButton1');
    radioButton2 = screen.getByDisplayValue('test-radioButton2');
    radioButton3 = screen.getByDisplayValue('test-radioButton3');

    // RadioButton's onChange is only called when radioButton is not checked. Second click on the same radio won't call onChange.
    expect(spyOnChange).toHaveBeenCalledTimes(2);

    expect(radioButton1.checked).toBe(false);
    expect(radioButton1.disabled).toBe(false);
    expect(radioButton2.checked).toBe(true);
    expect(radioButton2.disabled).toBe(false);
    expect(radioButton3.checked).toBe(false);
    expect(radioButton3.disabled).toBe(false);
  });

  it("RadioButtonsGroup - renders disabled radioButton, can't click on disabled radio", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    const modifiedradioButtonsData = [...radioButtonsData];
    modifiedradioButtonsData[0] = {
      ...modifiedradioButtonsData[0],
      disabled: true,
    };
    modifiedradioButtonsData[1] = {
      ...modifiedradioButtonsData[1],
      disabled: true,
    };

    const onChange = e => {
      spyOnChange(e.target.value);
    };

    // Initial render
    const {rerender} = render(
      <RadioButtonsGroup
        radioButtons={modifiedradioButtonsData}
        onChange={onChange}
      />
    );

    let radioButton1 = screen.getByDisplayValue('test-radioButton1');
    let radioButton2 = screen.getByDisplayValue('test-radioButton2');
    let radioButton3 = screen.getByDisplayValue('test-radioButton3');

    expect(radioButton1).toBeDefined();
    expect(radioButton1.checked).toBe(false);
    expect(radioButton1.disabled).toBe(true);

    expect(radioButton2).toBeDefined();
    expect(radioButton2.checked).toBe(false);
    expect(radioButton2.disabled).toBe(true);

    expect(radioButton3).toBeDefined();
    expect(radioButton3.checked).toBe(false);
    expect(radioButton3.disabled).toBe(false);

    await user.click(radioButton2);

    // Re-render after user's first click
    rerender(
      <RadioButtonsGroup
        radioButtons={modifiedradioButtonsData}
        onChange={onChange}
      />
    );

    radioButton1 = screen.getByDisplayValue('test-radioButton1');
    radioButton2 = screen.getByDisplayValue('test-radioButton2');
    radioButton3 = screen.getByDisplayValue('test-radioButton3');

    expect(spyOnChange).not.toHaveBeenCalled();

    expect(radioButton1.checked).toBe(false);
    expect(radioButton1.disabled).toBe(true);

    expect(radioButton2.checked).toBe(false);
    expect(radioButton2.disabled).toBe(true);

    expect(radioButton3.checked).toBe(false);
    expect(radioButton3.disabled).toBe(false);

    await user.click(radioButton3);

    // Re-render after user's second click
    rerender(
      <RadioButtonsGroup
        radioButtons={modifiedradioButtonsData}
        onChange={onChange}
      />
    );

    radioButton1 = screen.getByDisplayValue('test-radioButton1');
    radioButton2 = screen.getByDisplayValue('test-radioButton2');
    radioButton3 = screen.getByDisplayValue('test-radioButton3');

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith('test-radioButton3');

    expect(radioButton1.checked).toBe(false);
    expect(radioButton1.disabled).toBe(true);

    expect(radioButton2.checked).toBe(false);
    expect(radioButton2.disabled).toBe(true);

    expect(radioButton3.checked).toBe(true);
    expect(radioButton3.disabled).toBe(false);

    await user.click(radioButton2);

    // Re-render after user's third click (twice on the same radio button)
    rerender(
      <RadioButtonsGroup
        radioButtons={modifiedradioButtonsData}
        onChange={onChange}
      />
    );

    radioButton1 = screen.getByDisplayValue('test-radioButton1');
    radioButton2 = screen.getByDisplayValue('test-radioButton2');
    radioButton3 = screen.getByDisplayValue('test-radioButton3');

    // RadioButton's onChange is only called when radioButton is not checked. Second click on the same radio won't call onChange.
    expect(spyOnChange).toHaveBeenCalledTimes(1);

    expect(radioButton1.checked).toBe(false);
    expect(radioButton1.disabled).toBe(true);

    expect(radioButton2.checked).toBe(false);
    expect(radioButton2.disabled).toBe(true);

    expect(radioButton3.checked).toBe(true);
    expect(radioButton3.disabled).toBe(false);
  });
});
