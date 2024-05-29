import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon';

import TextField from '@cdo/apps/componentLibrary/textField';

import {expect} from '../../util/reconfiguredChai';

describe('Design System - TextField', () => {
  it('TextField - renders with correct label', () => {
    render(
      <TextField
        name="test-textField"
        value="test"
        label="TextField label"
        onChange={() => null}
      />
    );

    const textField = screen.getByDisplayValue('test');
    expect(textField).to.exist;
    expect(screen.getByText('TextField label')).to.exist;
  });

  it('TextField - changes value via keyboard input', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    let value = 'test-textfield';

    const onChange = e => {
      value = e.target.value;
      spyOnChange(value);
    };

    const TextFieldToRender = () => (
      <TextField
        name="test-textField"
        label="TextField label"
        value={value}
        onChange={onChange}
      />
    );

    // Initial rendered
    const {rerender} = render(<TextFieldToRender />);

    let textField = screen.getByDisplayValue(`${value}`);
    expect(textField).to.exist;

    expect(textField.value).to.equal(value);
    expect(textField.disabled).to.be.false;

    await user.click(textField);
    await user.keyboard('1');
    //
    // Re-render after user's first click
    rerender(<TextFieldToRender />);

    textField = screen.getByDisplayValue(value);

    expect(textField.value).to.equal(value);
    expect(textField.disabled).to.be.false;

    await user.click(textField);
    await user.keyboard('2');

    // Re-render after user's second click
    rerender(<TextFieldToRender />);

    textField = screen.getByDisplayValue(value);

    expect(spyOnChange).to.have.been.calledTwice;
    expect(spyOnChange).to.have.been.calledWith(value);
    expect(textField.value).to.equal(value);
    expect(textField.disabled).to.be.false;
  });

  it("TextField - renders disabled TextField, doesn't change value via keyboard input", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    const initialValue = 'test-textfield';
    let value = initialValue;

    const onChange = e => {
      value = e.target.value;
      spyOnChange(value);
    };

    const TextFieldToRender = () => (
      <TextField
        name="test-textField"
        label="TextField label"
        value={value}
        onChange={onChange}
        disabled={true}
      />
    );

    // Initial rendered
    const {rerender} = render(<TextFieldToRender />);

    let textField = screen.getByDisplayValue(`${initialValue}`);
    expect(textField).to.exist;

    expect(textField.value).to.equal(initialValue);
    expect(textField.disabled).to.be.true;
    expect(textField.readOnly).to.be.false;

    await user.click(textField);
    await user.keyboard('1');
    //
    // Re-render after user's first click
    rerender(<TextFieldToRender />);

    textField = screen.getByDisplayValue(`${initialValue}`);

    expect(textField.value).to.equal(initialValue);
    expect(textField.disabled).to.be.true;
    expect(textField.readOnly).to.be.false;

    await user.click(textField);
    await user.keyboard('2');

    // Re-render after user's second click
    rerender(<TextFieldToRender />);

    textField = screen.getByDisplayValue(`${initialValue}`);

    expect(spyOnChange).to.have.not.been.called;
    expect(textField.value).to.equal(initialValue);
    expect(textField.disabled).to.be.true;
    expect(textField.readOnly).to.be.false;
  });

  it("TextField - renders readOnly TextField, doesn't change value via keyboard input", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    const initialValue = 'test-textfield';
    let value = initialValue;

    const onChange = e => {
      value = e.target.value;
      spyOnChange(value);
    };

    const TextFieldToRender = () => (
      <TextField
        name="test-textField"
        label="TextField label"
        value={value}
        onChange={onChange}
        readonly={true}
      />
    );

    // Initial rendered
    const {rerender} = render(<TextFieldToRender />);

    let textField = screen.getByDisplayValue(`${initialValue}`);
    expect(textField).to.exist;

    expect(textField.value).to.equal(initialValue);
    expect(textField.disabled).to.be.false;
    expect(textField.readOnly).to.be.true;

    await user.click(textField);
    await user.keyboard('1');
    //
    // Re-render after user's first click
    rerender(<TextFieldToRender />);

    textField = screen.getByDisplayValue(`${initialValue}`);

    expect(textField.value).to.equal(initialValue);
    expect(textField.disabled).to.be.false;
    expect(textField.readOnly).to.be.true;

    await user.click(textField);
    await user.keyboard('2');

    // Re-render after user's second click
    rerender(<TextFieldToRender />);

    textField = screen.getByDisplayValue(`${initialValue}`);

    expect(spyOnChange).to.have.not.been.called;
    expect(textField.value).to.equal(initialValue);
    expect(textField.disabled).to.be.false;
    expect(textField.readOnly).to.be.true;
  });
});
