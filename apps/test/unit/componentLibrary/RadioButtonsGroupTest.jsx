import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';

import {expect} from '../../util/reconfiguredChai';

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

    expect(radioButton1).to.exist;
    expect(radioButton2).to.exist;
    expect(radioButton3).to.exist;
    expect(screen.getByText('Radio Button1 label')).to.exist;
    expect(screen.getByText('Radio Button2 label')).to.exist;
    expect(screen.getByText('Radio Button3 label')).to.exist;
    expect(radioButton1.checked).to.be.false;
    expect(radioButton2.checked).to.be.true;
    expect(radioButton3.checked).to.be.false;
  });

  it('RadioButtonsGroup - selects radio on click, can change selected button by clicking on other radio button ', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

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

    expect(radioButton1).to.exist;
    expect(radioButton1.checked).to.be.false;
    expect(radioButton1.disabled).to.be.false;

    expect(radioButton2).to.exist;
    expect(radioButton2.checked).to.be.false;
    expect(radioButton2.disabled).to.be.false;

    expect(radioButton3).to.exist;
    expect(radioButton3.checked).to.be.false;
    expect(radioButton3.disabled).to.be.false;

    await user.click(radioButton3);

    // Re-render after user's first click
    rerender(
      <RadioButtonsGroup radioButtons={radioButtonsData} onChange={onChange} />
    );

    radioButton1 = screen.getByDisplayValue('test-radioButton1');
    radioButton2 = screen.getByDisplayValue('test-radioButton2');
    radioButton3 = screen.getByDisplayValue('test-radioButton3');

    expect(spyOnChange).to.have.been.calledOnce;
    expect(spyOnChange).to.have.been.calledWith('test-radioButton3');

    expect(radioButton1.checked).to.be.false;
    expect(radioButton1.disabled).to.be.false;
    expect(radioButton2.checked).to.be.false;
    expect(radioButton2.disabled).to.be.false;
    expect(radioButton3.checked).to.be.true;
    expect(radioButton3.disabled).to.be.false;

    await user.click(radioButton2);

    // Re-render after user's second click
    rerender(
      <RadioButtonsGroup radioButtons={radioButtonsData} onChange={onChange} />
    );

    radioButton1 = screen.getByDisplayValue('test-radioButton1');
    radioButton2 = screen.getByDisplayValue('test-radioButton2');
    radioButton3 = screen.getByDisplayValue('test-radioButton3');

    expect(spyOnChange).to.have.been.calledTwice;
    expect(spyOnChange).to.have.been.calledWith('test-radioButton2');

    expect(radioButton1.checked).to.be.false;
    expect(radioButton1.disabled).to.be.false;
    expect(radioButton2.checked).to.be.true;
    expect(radioButton2.disabled).to.be.false;
    expect(radioButton3.checked).to.be.false;
    expect(radioButton3.disabled).to.be.false;

    await user.click(radioButton2);

    // Re-render after user's third click (twice on the same radio button)
    rerender(
      <RadioButtonsGroup radioButtons={radioButtonsData} onChange={onChange} />
    );

    radioButton1 = screen.getByDisplayValue('test-radioButton1');
    radioButton2 = screen.getByDisplayValue('test-radioButton2');
    radioButton3 = screen.getByDisplayValue('test-radioButton3');

    // RadioButton's onChange is only called when radioButton is not checked. Second click on the same radio won't call onChange.
    expect(spyOnChange).to.have.been.calledTwice;

    expect(radioButton1.checked).to.be.false;
    expect(radioButton1.disabled).to.be.false;
    expect(radioButton2.checked).to.be.true;
    expect(radioButton2.disabled).to.be.false;
    expect(radioButton3.checked).to.be.false;
    expect(radioButton3.disabled).to.be.false;
  });

  it("RadioButtonsGroup - renders disabled radioButton, can't click on disabled radio", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

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

    expect(radioButton1).to.exist;
    expect(radioButton1.checked).to.be.false;
    expect(radioButton1.disabled).to.be.true;

    expect(radioButton2).to.exist;
    expect(radioButton2.checked).to.be.false;
    expect(radioButton2.disabled).to.be.true;

    expect(radioButton3).to.exist;
    expect(radioButton3.checked).to.be.false;
    expect(radioButton3.disabled).to.be.false;

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

    expect(spyOnChange).to.have.not.been.called;

    expect(radioButton1.checked).to.be.false;
    expect(radioButton1.disabled).to.be.true;

    expect(radioButton2.checked).to.be.false;
    expect(radioButton2.disabled).to.be.true;

    expect(radioButton3.checked).to.be.false;
    expect(radioButton3.disabled).to.be.false;

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

    expect(spyOnChange).to.have.been.calledOnce;
    expect(spyOnChange).to.have.been.calledWith('test-radioButton3');

    expect(radioButton1.checked).to.be.false;
    expect(radioButton1.disabled).to.be.true;

    expect(radioButton2.checked).to.be.false;
    expect(radioButton2.disabled).to.be.true;

    expect(radioButton3.checked).to.be.true;
    expect(radioButton3.disabled).to.be.false;

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
    expect(spyOnChange).to.have.been.calledOnce;

    expect(radioButton1.checked).to.be.false;
    expect(radioButton1.disabled).to.be.true;

    expect(radioButton2.checked).to.be.false;
    expect(radioButton2.disabled).to.be.true;

    expect(radioButton3.checked).to.be.true;
    expect(radioButton3.disabled).to.be.false;
  });
});
