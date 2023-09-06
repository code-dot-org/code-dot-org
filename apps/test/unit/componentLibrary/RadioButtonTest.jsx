import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';

import {expect} from '../../util/reconfiguredChai';

import RadioButton from '@cdo/apps/componentLibrary/radioButton';
describe('Design System - Radio Button', () => {
  it('RadioButton - renders with correct label', () => {
    const radioButtonLabel = 'Radio Button label';

    render(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
      />
    );

    const radioButton = screen.getByDisplayValue('test-radioButton');

    expect(radioButton).to.exist;
    expect(screen.getByText(radioButtonLabel)).to.exist;
  });

  it('RadioButton - selects button when clicked, once selected - remains selected if clicked again', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
      />
    );

    let radioButton = screen.getByDisplayValue('test-radioButton');

    expect(radioButton).to.exist;
    expect(radioButton.checked).to.be.false;
    expect(radioButton.disabled).to.be.false;

    await user.click(radioButton);

    // Re-render after user's first click
    rerender(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
      />
    );

    radioButton = screen.getByDisplayValue('test-radioButton');

    expect(spyOnChange).to.have.been.calledOnce;
    expect(spyOnChange).to.have.been.calledWith(true);
    expect(radioButton.checked).to.be.true;
    expect(radioButton.disabled).to.be.false;

    await user.click(radioButton);

    // Re-render after user's second click
    rerender(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
      />
    );

    radioButton = screen.getByDisplayValue('test-radioButton');

    // RadioButton's onChange is only called when radioButton is not checked. Second click won't call onChange.
    expect(spyOnChange).to.have.been.calledOnce;
    expect(radioButton.checked).to.be.true;
    expect(radioButton.disabled).to.be.false;
  });

  it("RadioButton - renders disabled radio button, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    let radioButton = screen.getByDisplayValue('test-radioButton');

    expect(radioButton).to.exist;
    expect(radioButton.checked).to.be.false;
    expect(radioButton.disabled).to.be.true;

    await user.click(radioButton);

    // Re-render after user's first click
    rerender(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    radioButton = screen.getByDisplayValue('test-radioButton');

    expect(spyOnChange).to.not.have.been.called;
    expect(radioButton.checked).to.be.false;
    expect(radioButton.disabled).to.be.true;

    await user.click(radioButton);

    // Re-render after user's second click
    rerender(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    radioButton = screen.getByDisplayValue('test-radioButton');

    expect(spyOnChange).to.not.have.been.called;
    expect(radioButton.checked).to.be.false;
    expect(radioButton.disabled).to.be.true;
  });
});
